import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import InputSearch from "@/components/InputSearch";
import RedButton from "@/components/atoms/RedButton";
import RedWhip from "@/components/atoms/RedWhip";
import { Smile } from "lucide-react";
import { HeroSectionProps } from "@/types";
import { dishesAPI } from "@/apis";
import StarRating from "@/components/atoms/StarRating";
import AppStoreBadges from "@/components/AppStoreBadges";
import { BUSINESS, reviewCountLabel } from "@/contents/business";

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
    // Live price for the featured dish so the hero never advertises a stale price
    const [biryaniPrice, setBiryaniPrice] = useState<number | null>(null);
    useEffect(() => {
        dishesAPI.getDishesByCategory("Biryani")
            .then((dishes) => {
                const d = dishes.find((x) => /^chicken biryani$/i.test((x.dishName ?? x.name ?? "").trim()));
                if (d) setBiryaniPrice(Number(d.price));
            })
            .catch(() => {});
    }, []);

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden w-full pt-12">
            <div
                className="absolute inset-0 max-h-screen"
                style={{
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url("/assets/images/background.png")`,
                }}
            />
            {/* Content Container */}
            <div className="container-custom section-spacing">
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Left side content */}
                    {/* Visible from first paint: this column holds the LCP headline */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left z-20">
                        <h1 className="text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance">
                            Experience the Ultimate Taste
                            <span className="block text-primary mt-1">Best Biryani in Adelaide</span>
                        </h1>

                        <RedWhip className="hidden lg:block lg:ml-80 mt-2" />

                        <div
                            className="text-2xl font-semibold md:text-3xl mt-6"
                        >
                            Specializing in Mughlai Cuisine
                        </div>

                        <div
                            className="flex items-center bg-primary/10 rounded-full w-fit py-1.5 pl-1.5 pr-4 mt-3 mx-auto lg:mx-0"
                        >
                            <div className="flex items-center justify-center bg-primary rounded-full w-5 h-5 mr-3">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3.172 5.172a4.004 4.004 0 015.656 0L10 6.343l1.172-1.171a4.004 4.004 0 015.656 5.656l-6.343 6.343a.75.75 0 01-1.06 0L3.172 10.83a4.004 4.004 0 010-5.656z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                            <div className="text-black text-xs font-medium">
                                Trusted by food lovers across Adelaide
                            </div>
                        </div>

                        <div className="mt-3">
                            <InputSearch placeholder="Explore our Delicacies" onSearch={onSearch} />
                        </div>

                        <div
                            className="flex flex-wrap justify-center lg:justify-start items-center gap-4 mt-4"
                        >
                            <Link to="/Order" className="w-full sm:w-auto">
                                <RedButton
                                    className="h-12 w-full sm:w-fit flex items-center justify-center font-semibold"
                                    image="/assets/icons/order.png"
                                    alt="Biryani Darbaar - Order"
                                    name="Order Food"
                                    variant="active"
                                />
                            </Link>
                            <Link to="/Contact" className="w-full sm:w-auto">
                                <RedButton
                                    className="h-12 w-full sm:w-fit flex items-center justify-center font-semibold"
                                    image="/assets/icons/catering.png"
                                    alt="Biryani Darbaar - Catering"
                                    name="Book Catering Services"
                                    variant="active"
                                />
                            </Link>
                        </div>

                        <AppStoreBadges className="items-center lg:items-start mt-8" />
                    </div>

                    {/* Right side content */}
                    <motion.div
                        className="hidden lg:flex lg:w-1/2 items-center justify-end relative"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative">
                            {/* Happy Customer Badge */}
                            <a
                                href={BUSINESS.googleReviewsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute top-0 right-0 gap-3 py-2.5 pl-3 pr-4 bg-white rounded-2xl flex items-center shadow-[0_10px_25px_-12px_rgba(0,0,0,0.35)] z-30 hover:-translate-y-0.5 transition-transform"
                            >
                                <Smile className="w-9 h-9 text-amber-400 shrink-0" />
                                <div className="flex flex-col">
                                    <div className="text-xs font-semibold">Our Happy Customers</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-sm font-bold tabular-nums">{BUSINESS.rating}</span>
                                        <StarRating rating={BUSINESS.rating} size={12} />
                                    </div>
                                    <div className="text-[11px] text-neutral-500">{reviewCountLabel}</div>
                                </div>
                            </a>

                            {/* Chicken Biryani Card */}
                            {biryaniPrice !== null && (
                                <Link
                                    to="/Order"
                                    className="absolute -left-20 top-16 bg-white flex items-center gap-2.5 py-2 pl-2 pr-4 rounded-2xl shadow-[0_10px_25px_-12px_rgba(0,0,0,0.35)] z-30 hover:-translate-y-0.5 transition-transform"
                                >
                                    <img className="w-10" src="/assets/icons/biryani.png" alt="" />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold">Chicken Biryani</span>
                                        <span className="text-sm font-semibold text-primary tabular-nums">${biryaniPrice.toFixed(2)}</span>
                                    </div>
                                </Link>
                            )}

                            {/* Girl Image with Circle */}
                            <div className="w-[410px] h-[410px] rounded-full bg-primary overflow-hidden relative z-20">
                                <img
                                    src="/assets/images/hero-model.png"
                                    alt="Biryani Darbaar - Food delivery"
                                    className="max-h-[500px] ml-5 -mt-24 object-cover"
                                />
                            </div>

                            {/* Bottom Border Arc */}
                            <div className="w-[485px] h-[225px] z-20 border-[23px] border-shade rounded-b-full border-t-0 -mt-48 -ml-9"></div>

                            {/* Rotating Meal Circles */}
                            <motion.img
                                className="absolute -bottom-8 -left-32 w-44 z-20"
                                src="/assets/images/rounded-meal/rounded-meal-1.png"
                                alt="Biryani Darbaar"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.img
                                className="absolute -bottom-32 left-4 w-56 z-20"
                                src="/assets/images/rounded-meal/rounded-meal-2.png"
                                alt="Biryani Darbaar"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.img
                                className="absolute -bottom-32 right-2 w-52 z-20"
                                src="/assets/images/rounded-meal/rounded-meal-3.png"
                                alt="Biryani Darbaar"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.img
                                className="absolute top-56 -right-32 w-54 z-20"
                                src="/assets/images/rounded-meal/rounded-meal-4.png"
                                alt="Biryani Darbaar"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
