"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  submitRating,
  editRating,
  removeRating,
  selectUserRatingForMedia,
  selectRatingsStatus,
} from "@/lib/features/ratings/ratingsSlice";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import type { AppDispatch } from "@/lib/store";
import { toast } from "sonner";

interface RatingInputProps {
  mediaId: string;
  onRatingChange?: (rating: number | null) => void;
}

export function RatingInput({ mediaId, onRatingChange }: RatingInputProps) {
  const dispatch = useDispatch<AppDispatch>();
  const userRating = useSelector(selectUserRatingForMedia(mediaId));
  const status = useSelector(selectRatingsStatus);

  const [rating, setRating] = useState<number>(userRating?.rating || 0);
  const [isEditing, setIsEditing] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    try {
      if (userRating) {
        await dispatch(
          editRating({ ratingId: userRating.id, rating })
        ).unwrap();
        toast.success("Rating updated", {
          description: "Your rating has been updated successfully",
        });
      } else {
        await dispatch(submitRating({ mediaId, rating })).unwrap();
        toast.success("Rating submitted", {
          description: "Your rating has been submitted successfully",
        });
      }

      setIsEditing(false);
      onRatingChange?.(rating);
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to submit rating",
      });
    }
  };

  const handleDelete = async () => {
    if (!userRating) return;

    try {
      await dispatch(removeRating(userRating.id)).unwrap();
      setRating(0);
      setIsEditing(false);
      toast.success("Rating removed", {
        description: "Your rating has been removed successfully",
      });
      onRatingChange?.(null);
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to remove rating",
      });
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StarRating
          value={rating}
          onChange={handleRatingChange}
          readOnly={isLoading}
        />
        <span className="text-sm font-medium">
          {rating > 0 ? `${rating}/10` : "Rate this"}
        </span>
      </div>

      {isEditing && (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading || rating === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {userRating ? "Update" : "Submit"}
          </Button>

          {userRating && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRating(userRating?.rating || 0);
              setIsEditing(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
