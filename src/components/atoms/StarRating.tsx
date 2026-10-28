import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  /** Icon size in px */
  size?: number;
  className?: string;
}

/** Five drawn stars with fractional fill (e.g. 4.5 → four and a half). */
const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, className = "" }) => (
  <div className={`flex gap-0.5 ${className}`} role="img" aria-label={`${rating} out of 5 stars`}>
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = Math.max(0, Math.min(1, rating - i));
      return (
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <Star size={size} className="absolute inset-0 text-neutral-300" fill="currentColor" strokeWidth={0} />
          {fill > 0 && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-amber-400" fill="currentColor" strokeWidth={0} />
            </span>
          )}
        </span>
      );
    })}
  </div>
);

export default StarRating;
