"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeReview,
  toggleLikeReview,
  selectReviewsStatus,
} from "@/lib/features/reviews/reviewsSlice";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReviewForm } from "./review-form";
import { toast } from "sonner";
import {
  MoreVertical,
  ThumbsUp,
  Edit,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@/lib/features/reviews/reviewsSlice";
import type { AppDispatch, RootState } from "@/lib/store";

interface ReviewCardProps {
  review: Review;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export function ReviewCard({ review, onDelete, onUpdate }: ReviewCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector(selectReviewsStatus);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isCurrentUser = user?.id === review.userId;
  const formattedDate = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    try {
      await dispatch(removeReview(review.id)).unwrap();
      toast.success("Review deleted", {
        description: "Your review has been deleted successfully",
      });
      onDelete?.();
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete review",
      });
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      await dispatch(toggleLikeReview(review.id)).unwrap();
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to like review",
      });
    } finally {
      setIsLiking(false);
    }
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <ReviewForm
            mediaId={review.mediaId}
            reviewId={review.id}
            initialContent={review.content}
            onSuccess={() => {
              setIsEditing(false);
              onUpdate?.();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Link href={`/users/${review.user?.id || review.userId}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={review.user?.avatar}
                alt={review.user?.name || "User"}
              />
              <AvatarFallback>
                {(review.user?.name || "U").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/users/${review.user?.id || review.userId}`}
                  className="font-medium hover:underline"
                >
                  {review.user?.name || "User"}
                </Link>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {formattedDate}
                </div>
              </div>

              {isCurrentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="mt-2 text-sm">{review.content}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between py-2">
        <Button
          variant="ghost"
          size="sm"
          className={review.isLiked ? "text-primary" : ""}
          onClick={handleLike}
          disabled={isLiking || status === "loading"}
        >
          {isLiking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp
              className={`mr-2 h-4 w-4 ${review.isLiked ? "fill-current" : ""}`}
            />
          )}
          {review.likesCount} {review.likesCount === 1 ? "Like" : "Likes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
