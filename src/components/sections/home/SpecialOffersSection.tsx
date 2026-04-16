import Loading from "@/components/Loading";
import ErrorFallback from "@/components/ErrorFallback";
import UnifiedSlider from "@/components/UnifiedSlider";
import ArchedCard from "@/components/cards/ArchedCard";
import { SpecialOffersSectionProps } from "@/types";
import type { SpecialMediaItem } from "@/apis/media";

interface SpecialOffersSectionExtendedProps extends SpecialOffersSectionProps {
  mediaItems?: SpecialMediaItem[];
}

const isVideoUrl = (url: string) =>
  /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes("video");

const SpecialOffersSection: React.FC<SpecialOffersSectionExtendedProps> = ({
  specialDishes,
  mediaItems,
  loading = false,
  error = false,
  onRetry,
}) => {
  // ── Prefer admin-uploaded media; fall back to dishes ──────────────────────
  const useMedia  = Array.isArray(mediaItems) && mediaItems.length > 0;
  const dishes    = Array.isArray(specialDishes) ? specialDishes : [];
  const hasContent = useMedia || dishes.length > 0;

  // Build slider items from media uploads
  const mediaSliderItems = useMedia
    ? (mediaItems as SpecialMediaItem[]).map((item) => {
        const url = item.url ?? item.mediaUrl ?? "";
        const vid = isVideoUrl(url);
        return {
          content: (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden shadow-lg w-full"
              style={{ maxWidth: 340 }}
            >
              {vid ? (
                <video
                  src={url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full object-cover"
                  style={{ maxHeight: 340 }}
                />
              ) : (
                <img
                  src={url}
                  alt="Special Offer"
                  className="w-full object-cover"
                  style={{ maxHeight: 340 }}
                />
              )}
            </div>
          ),
        };
      })
    : [];

  // Build slider items from dishes (legacy)
  const dishSliderItems = dishes.map((dish) => ({
    content: (
      <ArchedCard
        image={dish.image}
        title={dish.dishName || dish.name || "Delicious Dish"}
        description={dish.description || "Delicious dish available now!"}
        buttonTitle="Order Now"
        price={`$${dish.price}`}
        className="h-fit w-[310px]"
      />
    ),
  }));

  const sliderItems = useMedia ? mediaSliderItems : dishSliderItems;

  return (
    <div className="container-custom">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold">
          <span className="text-primary">Special</span> Offers Today
        </h2>
        <p className="mt-6 text-base md:text-lg text-neutral-600 max-w-3xl mx-auto">
          Chicken Biryani is a delicious savory rice dish that is loaded with
          spicy marinated chicken, caramelized onions, and flavorful saffron
          rice.
        </p>
      </div>

      <div className="mt-12 mb-4">
        {loading ? (
          <Loading text="Loading special offers..." />
        ) : error ? (
          <ErrorFallback
            message="Failed to load special offers"
            onRetry={onRetry}
          />
        ) : hasContent ? (
          <UnifiedSlider
            items={sliderItems}
            slidesPerView={1}
            autoplayDelay={3000}
            autoplay={true}
            spaceBetween={24}
            loop={sliderItems.length > 1}
            pagination={true}
            breakpoints={{
              640:  { slidesPerView: Math.min(2, sliderItems.length), spaceBetween: 24 },
              768:  { slidesPerView: Math.min(2, sliderItems.length), spaceBetween: 24 },
              1024: { slidesPerView: Math.min(3, sliderItems.length), spaceBetween: 24 },
            }}
            className={useMedia ? "special-media" : "arched"}
          />
        ) : (
          /* Empty state — no flash of spinner */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-neutral-500 text-lg font-medium">
              Special offers coming soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialOffersSection;
