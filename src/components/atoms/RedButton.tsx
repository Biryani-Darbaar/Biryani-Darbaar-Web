import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { RedButtonProps } from "@/types";

const RedButton: React.FC<RedButtonProps> = ({
  name,
  variant,
  className,
  image,
  alt,
  onClick,
}) => {
  const baseClasses: string =
    "px-6 py-3 cursor-pointer whitespace-nowrap transition-all duration-300 rounded-lg active:scale-95 font-medium border-2";
  const activeClasses: string = "bg-primary text-white hover:bg-red-600 border-primary";
  const inactiveClasses: string =
    "bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-300 hover:border-neutral-400";

  const buttonClasses: string = clsx(
    baseClasses,
    variant === "active" ? activeClasses : inactiveClasses,
    className
  );

  if (!image) {
    return (
      <motion.button
        className={buttonClasses}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
      >
        {name}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={buttonClasses}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      // Only interactive on its own when it has a handler; inside a <Link> the
      // link is the control, so a second tab stop would be redundant.
      {...(onClick && {
        role: "button",
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        },
      })}
    >
      <div className="flex items-center justify-center gap-3">
        <div className="w-9 h-9 bg-white flex justify-center items-center rounded-full shadow-sm">
          <img src={image} alt={alt ?? ""} className="w-6 h-6 object-contain" />
        </div>
        <span className="font-medium">{name}</span>
      </div>
    </motion.div>
  );
};

export default RedButton;
