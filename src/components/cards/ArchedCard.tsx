import { Link } from "react-router-dom";
import React from "react";
import clsx from "clsx";

interface CardComponentProps {
  image: string;
  title: string;
  description: string;
  buttonTitle: string;
  price: string;
  className?: string;
  /** Override the click-through destination (defaults to /Order) */
  href?: string;
}

const CardComponent: React.FC<CardComponentProps> = ({
  image,
  title,
  description,
  buttonTitle,
  price,
  className,
  href = "/Order",
}) => {
  return (
    <Link
      to={href}
      className={clsx(
        "group relative block w-full max-w-sm",
        className,
      )}
    >
      <div className="relative bg-white pb-8 pt-12 px-6 flex flex-col items-center rounded-b-xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1.5">
        {/* Arch SVG border */}
        <svg
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
          style={{ height: "100%", width: "100%", top: 0 }}
          viewBox="0 0 400 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M20,595 L20,180 C20,150 60,130 100,125 L100,110 C100,90 120,30 200,5 C280,30 300,90 300,110 L300,125 C340,130 380,150 380,180 L380,595 L20,595 Z"
            fill="none"
            stroke="#f4a261"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-300 group-hover:stroke-red-500"
          />
        </svg>

        {/* Dish image */}
        <div className="relative w-40 h-40 transition-transform duration-300 group-hover:scale-105">
          <img
            src={image}
            alt={`Biryani Darbaar - ${title}`}
            className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
          />
        </div>

        <div className="relative mb-4 flex justify-center" />

        {/* Price badge */}
        <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-yellow-300 via-orange-200 to-yellow-400 shadow-md text-neutral-900 font-extrabold text-xl border-2 border-yellow-500 transition-transform duration-300 group-hover:scale-105">
          {price}
        </span>

        <h2 className="text-xl font-bold text-red-600 mt-3 mb-2 text-center line-clamp-1">
          {title}
        </h2>

        <p className="text-sm text-neutral-600 text-center mb-4 line-clamp-2 px-2">
          {description}
        </p>

        {/* CTA button — pointer-events-none since the whole card is a Link */}
        <div className="w-full py-2 px-4">
          <div className="w-full px-6 py-3 bg-primary text-white text-center rounded-full font-semibold border border-primary transition-all duration-300 group-hover:bg-red-600 group-hover:shadow-md pointer-events-none">
            {buttonTitle}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CardComponent;
