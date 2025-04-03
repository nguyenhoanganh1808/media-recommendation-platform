"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  onChange?: (value: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  value,
  max = 10,
  size = "md",
  onChange,
  readOnly = false,
  className,
}: StarRatingProps) {
  const [rating, setRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);

  // Update internal state when prop changes
  useEffect(() => {
    setRating(value);
  }, [value]);

  const handleClick = (newRating: number) => {
    if (readOnly) return;

    setRating(newRating);
    onChange?.(newRating);
  };

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };

  // Determine star size based on prop
  const starSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  // Calculate the number of stars to display
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "flex items-center gap-0.5",
        readOnly ? "pointer-events-none" : "cursor-pointer",
        className
      )}
    >
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            "transition-all",
            (hoverRating || rating) >= star
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300 dark:text-gray-600",
            !readOnly && "hover:scale-110"
          )}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
}
