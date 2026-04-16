import React from "react";
import UnifiedSlider from "../UnifiedSlider";
import { reviews, ratingStats } from "../../contents/Reviews";
import { Review } from "@/types/common.types";

interface SliderItem {
    content: React.ReactNode;
}

const StarRow: React.FC<{ rating: number; size?: string }> = ({
    rating,
    size = "text-lg",
}) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className={`${size} ${star <= rating ? "text-yellow-400" : "text-neutral-300"}`}
            >
                ★
            </span>
        ))}
    </div>
);

const CustomerReviews: React.FC = () => {
    const sliderItems: SliderItem[] = reviews.map((review: Review) => ({
        content: (
            <div className="w-full bg-white p-6 rounded-xl border border-neutral-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 h-full">
                {/* Stars */}
                <StarRow rating={review.rating} />

                {/* Review text */}
                <p className="text-neutral-700 text-sm leading-relaxed line-clamp-5 flex-1">
                    {review.review}
                </p>

                {/* Reviewer info */}
                <div className="pt-3 border-t border-neutral-100">
                    <p className="font-bold text-neutral-900 text-base">{review.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                        <p className="text-sm text-primary font-medium">{review.location} 🏠</p>
                        <p className="text-xs text-neutral-400">{review.date}</p>
                    </div>
                </div>
            </div>
        ),
    }));

    const { totalRating, maxStars, fullStars, totalReviews } = ratingStats;

    return (
        <div className="container-custom pb-20">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
                        Customer Reviews
                    </h2>
                    <p className="text-neutral-500 mt-1 text-base">
                        What our customers are saying
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3">
                    <div className="text-4xl font-extrabold text-neutral-900 leading-none">
                        {totalRating}
                    </div>
                    <div>
                        <div className="flex gap-0.5">
                            {[...Array(fullStars)].map((_: undefined, i: number) => (
                                <span key={i} className="text-xl text-yellow-400">★</span>
                            ))}
                            {[...Array(maxStars - fullStars)].map((_: undefined, i: number) => (
                                <span key={`e-${i}`} className="text-xl text-neutral-300">★</span>
                            ))}
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">{totalReviews}</p>
                    </div>
                </div>
            </div>

            <UnifiedSlider
                items={sliderItems}
                slidesPerView={3}
                spaceBetween={20}
                autoplay={true}
                autoplayDelay={5000}
                loop={true}
                pagination={true}
                breakpoints={{
                    0:    { slidesPerView: 1 },
                    640:  { slidesPerView: 1 },
                    768:  { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
            />
        </div>
    );
};

export default CustomerReviews;
