// Slider content constants

// Dine-in menu items
export interface DineInMenuItem {
  image: string;
  label: string;
}

export const DINE_IN_MENU_ITEMS: DineInMenuItem[] = [
  {
    image: "/assets/images/categories/starters.png",
    label: "STARTERS",
  },
  {
    image: "/assets/images/categories/kebab.png",
    label: "CHARCOAL KEBABS",
  },
  {
    image: "/assets/images/categories/chickencurries.png",
    label: "CHICKEN CURRIES",
  },
  {
    image: "/assets/images/categories/chickenbiryani.svg",
    label: "BIRYANI SPECIALS",
  },
];

// Special offers for image slider
export interface SpecialOffer {
  image: string;
  title: string;
  subtitle: string;
  discount: string;
}

export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    image: "/assets/images/slider/slider-image-1.png",
    title: "First Order Discount",
    subtitle: "Biryani Darbaar in Athol Park",
    discount: "-20%",
  },
  {
    image: "/assets/images/slider/slider-image-2.jpg",
    title: "Biryani Discount",
    subtitle: "Biryani Darbaar in Athol Park",
    discount: "-20%",
  },
  {
    image: "/assets/images/slider/slider-image-3.jpg",
    title: "Haleem Offer",
    subtitle: "Biryani Darbaar in Athol Park",
    discount: "-15%",
  },
];
