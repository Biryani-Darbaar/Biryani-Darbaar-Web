import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { mediaAPI } from "@/apis";
import type { SpecialMediaItem } from "@/apis/media";
import LargeImageView from "@/components/LargeImageView";

// ─── helpers ─────────────────────────────────────────────────────────────────

const isVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes("video");

// ─── Video card ───────────────────────────────────────────────────────────────

interface VideoCardProps {
  item: SpecialMediaItem;
  index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ item, index }) => {
  const url = item.url ?? item.mediaUrl ?? "";
  const vid = isVideoUrl(url) || item.type?.startsWith("video");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause / play based on IntersectionObserver so off-screen videos pause
  useEffect(() => {
    if (!vid || !videoRef.current) return;
    const el = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [vid]);

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-neutral-900"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      {/* Media */}
      <div className="aspect-video w-full">
        {vid ? (
          <video
            ref={videoRef}
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={url}
            alt={`Special Offer ${index + 1}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Badge */}
      <div className="absolute top-3 left-3">
        <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {vid ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Video
            </>
          ) : (
            "Image"
          )}
        </span>
      </div>

      {/* Slot number */}
      <div className="absolute top-3 right-3">
        <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
          #{index + 1}
        </span>
      </div>

      {/* Bottom label (shows on hover) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-white text-sm font-semibold drop-shadow-lg">
          Special Offer {index + 1}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl overflow-hidden bg-neutral-200 animate-pulse aspect-video" />
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const SpecialOffer: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<SpecialMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await mediaAPI.getSpecialOfferMedia();
      setMediaItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* ── Hero ── */}
      <div className="container-custom section-spacing mt-12">
        <LargeImageView
          title="Special Offers"
          description="Discover our exclusive deals and limited-time promotions on your favourite dishes."
        />
      </div>

      {/* ── Media section ── */}
      <section className="container-custom pb-16">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800">
            Today&apos;s{" "}
            <span className="text-primary">Special</span> Offers
          </h1>
          <p className="text-neutral-500 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
            Limited-time deals made with love — order before they&apos;re gone!
          </p>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-5xl">😕</p>
            <p className="text-neutral-600 text-xl font-medium">
              Failed to load special offers.
            </p>
            <button
              onClick={fetchMedia}
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && mediaItems.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-7xl mb-6">🍽️</p>
            <p className="text-neutral-600 text-2xl font-semibold">
              Special offers coming soon!
            </p>
            <p className="text-neutral-400 mt-3 text-base max-w-md">
              Our team is preparing exclusive deals. Check back shortly.
            </p>
          </motion.div>
        )}

        {/* ── Media grid ── */}
        {!loading && !error && mediaItems.length > 0 && (
          <>
            {/*
              Desktop  → 3 columns (1fr 1fr 1fr)
              Tablet   → 2 columns, last card centred via CSS trick
              Mobile   → 1 column
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {mediaItems.map((item, i) => (
                <VideoCard key={item.id} item={item} index={i} />
              ))}
            </div>

            {/* Decorative divider */}
            <div className="mt-16 flex items-center gap-4">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-neutral-400 text-sm font-medium px-2">
                All offers are subject to availability
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default SpecialOffer;
