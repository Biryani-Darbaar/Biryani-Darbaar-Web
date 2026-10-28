import React from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import UnifiedSlider from "../UnifiedSlider";
import StarRating from "../atoms/StarRating";
import { reviews } from "../../contents/Reviews";
import { BUSINESS, reviewCountLabel } from "../../contents/business";
import { Review } from "@/types/common.types";

interface SliderItem {
    content: React.ReactNode;
}

const CustomerReviews: React.FC = () => {
    const sliderItems: SliderItem[] = reviews.map((review: Review) => ({
        content: (
            <div className="w-full bg-white p-6 rounded-xl border border-neutral-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col gap-3 h-full">
                {/* Stars */}
                <StarRating rating={review.rating} size={18} />

                {/* Review text */}
                <p className="text-neutral-700 text-sm leading-relaxed line-clamp-5 flex-1">
                    {review.review}
                </p>

                {/* Reviewer info */}
                <div className="pt-3 border-t border-neutral-100">
                    <p className="font-bold text-neutral-900 text-base">{review.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                        <p className="flex items-center gap-1 text-sm text-primary font-medium">
                            <MapPin size={14} /> {review.location}
                        </p>
                        <p className="text-xs text-neutral-400">{review.date}</p>
                    </div>
                </div>
            </div>
        ),
    }));

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

                <a
                    href={BUSINESS.googleReviewsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-2xl px-5 py-3 hover:border-neutral-300 hover:bg-white transition-colors"
                >
                    <div className="text-4xl font-extrabold text-neutral-900 leading-none tabular-nums">
                        {BUSINESS.rating}
                    </div>
                    <div>
                        <StarRating rating={BUSINESS.rating} size={18} />
                        <p className="flex items-center gap-1 text-sm text-neutral-500 mt-1 group-hover:text-primary transition-colors">
                            {reviewCountLabel} <ArrowUpRight size={14} />
                        </p>
                    </div>
                </a>
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
