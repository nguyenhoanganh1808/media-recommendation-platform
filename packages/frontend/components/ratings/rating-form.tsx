"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { StarRating } from "./star-rating"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { submitRating, getUserRating, submitReview } from "@/lib/services/ratings"
import type { RootState } from "@/lib/store"
import {toast} from 'sonner'

interface RatingFormProps {
  mediaId: string
  mediaTitle: string
  onRatingSubmitted?: () => void
}

export function RatingForm({ mediaId, mediaTitle, onRatingSubmitted }: RatingFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Fetch user's existing rating when component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const fetchUserRating = async () => {
      try {
        setIsLoading(true)
        const response = await getUserRating(mediaId)
        if (response) {
          setUserRating(response.rating)
          setRating(response.rating)
        }
      } catch (error) {
        console.error("Error fetching user rating:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRating()
  }, [mediaId, isAuthenticated])

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleRatingSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate this media",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await submitRating(mediaId, rating)

      setUserRating(rating)

      toast({
        title: "Rating Submitted",
        description: `You rated ${mediaTitle} ${rating} out of 10`,
      })

      if (onRatingSubmitted) {
        onRatingSubmitted()
      }

      // Show review form after rating
      setShowReviewForm(true)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit rating",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Review Required",
        description: "Please enter a review before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await submitReview(mediaId, rating, comment)

      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully",
      })

      setComment("")
      setShowReviewForm(false)

      if (onRatingSubmitted) {
        onRatingSubmitted()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate this {mediaId.split("-")[0]}</CardTitle>
          <CardDescription>Sign in to rate and review {mediaTitle}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <a href={`/login?redirect=/media/${mediaId}`}>Sign In to Rate</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate this {mediaId.split("-")[0]}</CardTitle>
        <CardDescription>
          {userRating ? `You rated this ${userRating} out of 10` : `What did you think of ${mediaTitle}?`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <StarRating initialRating={rating} onRatingChange={handleRatingChange} size="lg" />
          <span className="text-sm font-medium">{rating > 0 ? `${rating} out of 10` : "Select a rating"}</span>
        </div>

        {showReviewForm && (
          <div className="space-y-2 pt-4">
            <h4 className="text-sm font-medium">Write a review (optional)</h4>
            <Textarea
              placeholder="Share your thoughts about this media..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {showReviewForm ? (
          <>
            <Button variant="outline" onClick={() => setShowReviewForm(false)} disabled={isSubmitting}>
              Skip
            </Button>
            <Button onClick={handleReviewSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </>
        ) : (
          <Button onClick={handleRatingSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : userRating ? (
              "Update Rating"
            ) : (
              "Submit Rating"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

