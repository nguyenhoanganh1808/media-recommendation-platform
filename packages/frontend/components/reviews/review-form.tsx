"use client";

import type React from "react";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitReview,
  editReview,
  selectUserReviewForMedia,
  selectReviewsStatus,
} from "@/lib/features/reviews/reviewsSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import { toast } from "sonner";

interface ReviewFormProps {
  mediaId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialContent?: string;
  reviewId?: string;
}

export function ReviewForm({
  mediaId,
  onSuccess,
  onCancel,
  initialContent = "",
  reviewId,
}: ReviewFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const userReview = useSelector(selectUserReviewForMedia(mediaId));
  const status = useSelector(selectReviewsStatus);

  const [content, setContent] = useState(
    initialContent || userReview?.content || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Error", {
        description: "Review content cannot be empty",
      });
      return;
    }

    try {
      if (reviewId || userReview) {
        await dispatch(
          editReview({
            reviewId: reviewId || userReview!.id,
            content,
          })
        ).unwrap();

        toast.success("Review updated", {
          description: "Your review has been updated successfully",
        });
      } else {
        await dispatch(submitReview({ mediaId, content })).unwrap();

        toast.success("Review submitted", {
          description: "Your review has been submitted successfully",
        });
      }

      onSuccess?.();
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to submit review",
      });
    }
  };

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Write your review here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        disabled={isLoading}
        className="resize-none"
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}

        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {reviewId || userReview ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
