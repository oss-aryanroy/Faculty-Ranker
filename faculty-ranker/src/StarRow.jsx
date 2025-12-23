import React from "react";

export default function StarRow({ rating, onRate, isInteractive }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const handler = (v) => {
    if (!onRate) return;
    onRate(v);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <button
          key={`full-${i}`}
          type="button"
          onClick={onRate ? () => handler(i + 1) : undefined}
          className={isInteractive && onRate ? "cursor-pointer" : "cursor-default"}
        >
          <span className="text-yellow-400 text-lg">★</span>
        </button>
      ))}

      {/* Half star - CSS-based overlay for better mobile compatibility */}
      {hasHalfStar && (
        <button
          type="button"
          onClick={onRate ? () => handler(fullStars + 1) : undefined}
          className={isInteractive && onRate ? "cursor-pointer" : "cursor-default"}
        >
          <span className="relative inline-block text-lg">
            <span className="text-gray-600">★</span>
            <span 
              className="absolute top-0 left-0 overflow-hidden text-yellow-400" 
              style={{ width: '50%' }}
            >
              ★
            </span>
          </span>
        </button>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <button
          key={`empty-${i}`}
          type="button"
          onClick={onRate ? () => handler(fullStars + (hasHalfStar ? 1 : 0) + i + 1) : undefined}
          className={isInteractive && onRate ? "cursor-pointer" : "cursor-default"}
        >
          <span className="text-gray-600 text-lg">★</span>
        </button>
      ))}

      <span className="ml-1 text-xs text-gray-300">{rating.toFixed(1)}</span>
    </div>
  );
}