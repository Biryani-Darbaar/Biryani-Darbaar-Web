/**
 * Component props type definitions
 */

// ============ Modal Props ============
export interface ModalProps {
  onClose: () => void;
}

export interface PromoModalProps extends ModalProps {
  onApplyPromo: (discount: number) => void;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

// ============ Image & Card Props ============
export interface LargeImageViewProps {
  title: string;
  description: string;
}

export interface ArchedCardProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  bgColor?: string;
}

export interface PromoCardProps {
  image: string;
  imageAlt: string;
  discount: string;
  offerTitle: string;
  offerSubtitle: string;
  onAddClick?: () => void;
}

export interface MenuCardProps {
  dishId: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
}

// ============ Button Props ============
export interface RedButtonProps {
  text?: string;
  name?: string;
  image?: string;
  alt?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "active" | "inactive";
}

// ============ Input Props ============
export interface InputSearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

// ============ Slider Props ============
export interface SliderProps {
  images?: string[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export interface SliderItem {
  image: string;
  title: string;
  description: string;
  price?: string;
}

export interface UnifiedSliderProps {
  items: SliderItem[];
  autoPlay?: boolean;
  interval?: number;
}

// ============ Loading & Error Props ============
export interface LoadingProps {
  text?: string;
}

export interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

// ============ Section Props ============
export interface HeroSectionProps {
  onSearch: (query: string) => void;
}

export interface MenuCategoriesSectionProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  dishes: import("./common.types").Dish[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export interface SpecialOffersSectionProps {
  mediaItems?: import("../apis/media").SpecialMediaItem[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

// ============ Sidebar & Menu Props ============
export interface SidebarProps {
  handleCategorySelect: (category: string) => void;
  handleOrdersSelect: () => void;
  handleClearOrders: () => void;
  activeCategory: string;
}

// ============ Provider Props ============
export interface CartProviderProps {
  children: React.ReactNode;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// ============ Dine In Menu Props ============
export interface DineInMenuItem {
  name: string;
  image: string;
  price: number;
  description?: string;
}

export interface DineInMenuSectionProps {
  items: DineInMenuItem[];
}
