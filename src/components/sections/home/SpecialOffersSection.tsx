import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ErrorFallback from "@/components/ErrorFallback";
import type { SpecialMediaItem } from "@/apis/media";

// ── Helpers ───────────────────────────────────────────────────────────────────

const isVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes("video");

// ── Single media item (video or image) ───────────────────────────────────────
// Rendered inside a CSS-columns masonry layout — images keep their natural
// aspect ratio (no forced crop) so tiles settle at different heights, while
// videos keep a fixed 16:9 box since arbitrary video aspect ratios read poorly.

interface MediaItemProps {
  item: SpecialMediaItem;
  index: number;
}

const MediaItem: React.FC<MediaItemProps> = ({ item, index }) => {
  const url    = item.url ?? item.mediaUrl ?? "";
  const isVid  = isVideoUrl(url) || item.type?.startsWith("video");
  const vidRef = useRef<HTMLVideoElement>(null);

  // Pause / play based on IntersectionObserver so off-screen videos pause
  useEffect(() => {
    if (!isVid || !vidRef.current) return;
    const el = vidRef.current;
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
  }, [isVid]);

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-neutral-900 w-full break-inside-avoid mb-4 md:mb-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    >
      {/* Media */}
      {isVid ? (
        <video
          ref={vidRef}
          src={url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full aspect-video object-cover"
        />
      ) : (
        <img
          src={url}
          alt={`Special Offer ${index + 1}`}
          loading="lazy"
          className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Video indicator (images need no label) */}
      {isVid && (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Video
          </span>
        </div>
      )}
    </motion.div>
  );
};

// ── Skeleton loader ───────────────────────────────────────────────────────────

const SkeletonCard: React.FC<{ aspect?: string }> = ({ aspect = "4/3" }) => (
  <div
    className="rounded-2xl overflow-hidden bg-neutral-200 animate-pulse w-full break-inside-avoid mb-4 md:mb-6"
    style={{ aspectRatio: aspect }}
  />
);

// ── Section ───────────────────────────────────────────────────────────────────

interface SpecialOffersSectionProps {
  mediaItems?: SpecialMediaItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({
  mediaItems = [],
  loading    = false,
  error      = false,
  onRetry,
}) => {
  const hasContent = mediaItems.length > 0;

  return (
    <div className="container-custom">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold">
          <span className="text-primary">Special</span> Offers Today
        </h2>
        <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
          Limited-time deals made with love — order before they&apos;re gone!
        </p>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6">
          <SkeletonCard aspect="4/3" />
          <SkeletonCard aspect="16/9" />
          <SkeletonCard aspect="3/4" />
          <SkeletonCard aspect="4/3" />
          <SkeletonCard aspect="1/1" />
          <SkeletonCard aspect="4/3" />
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <ErrorFallback message="Failed to load special offers" onRetry={onRetry} />
      )}

      {/* ── Empty state ── */}
      {!loading && !error && !hasContent && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-5xl mb-4">🍽️</p>
          <p className="text-neutral-500 text-lg font-medium">Special offers coming soon!</p>
        </div>
      )}

      {/* ── Media masonry ── */}
      {!loading && !error && hasContent && (
        // CSS-columns masonry — accommodates any number of uploaded items,
        // each tile keeping its natural image aspect ratio.
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6">
          {mediaItems.map((item, i) => (
            <MediaItem key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialOffersSection;
