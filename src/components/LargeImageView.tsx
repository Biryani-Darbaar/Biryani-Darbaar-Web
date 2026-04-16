import { motion, AnimatePresence, Variants } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Bike, Receipt, Timer } from "lucide-react";
import { heroImages } from "../contents/Services";
import { LargeImageViewProps } from "@/types/component.types";

const LargeImageView: React.FC<LargeImageViewProps> = ({
  title,
  description,
}) => {
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentImage((prev: number) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToImage = (index: number): void => {
    setDirection(index > currentImage ? 1 : -1);
    setCurrentImage(index);
  };

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full bg-yellow-100 rounded-lg border p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Section - Info */}
          <div className="space-y-6 flex flex-col h-full justify-center align-center">
            <p className="text-lg font-medium text-gray-700">{description}</p>
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-full">
                <Receipt className="w-5 h-5" />
                <span className="font-medium">Minimum Order:25 AUD</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-full">
                <Bike className="w-5 h-5" />
                <span className="font-medium">Delivery in 20-25 Minutes</span>
              </div>
            </div>

            {/* Open Status */}
            <motion.div
              className="flex items-center justify-start bg-primary bg-opacity-10 rounded-2xl w-fit p-4 h-7 mt-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-center bg-primary rounded-full w-5 h-5 mr-3">
                <Timer className="w-3 h-3 text-white" />
              </div>
              <div className="text-black text-xs font-medium">
                Open until 3:00 AM
              </div>
            </motion.div>
          </div>

          {/* Right Section - Image Carousel */}
          <div className="relative">
            {/* Rating Badge */}
            <div className="absolute -top-4 -right-4 z-10 bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-5xl font-bold text-gray-900 mb-1">3.4</div>
              <div className="flex gap-1 mb-2 justify-center">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">
                    ★
                  </span>
                ))}
                {[...Array(2)].map((_, i) => (
                  <span key={i} className="text-gray-300 text-xl">
                    ★
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">1,360 reviews</div>
            </div>

            {/* Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentImage}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.5 },
                  }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={heroImages[currentImage]}
                    alt={`Biryani Darbaar - Slide ${currentImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Dot Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`transition-all rounded-full ${
                      index === currentImage
                        ? "w-8 h-2 bg-white"
                        : "w-2 h-2 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LargeImageView;
