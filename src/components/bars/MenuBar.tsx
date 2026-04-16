import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { categoriesAPI } from "@/apis";
import PromoCard from "@/components/cards/PromoCard";
import { SidebarProps } from "@/types";

const Sidebar: React.FC<SidebarProps> = ({
  handleCategorySelect,
  handleOrdersSelect,
  handleClearOrders,
  activeCategory,
}) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string) => {
    handleClearOrders();
    handleCategorySelect(category);
  };

  return (
    <motion.aside
      className="w-full md:w-80 bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between h-fit md:h-screen md:sticky md:top-24 overflow-y-auto"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img
          src="/assets/icons/spoon.png"
          alt="Biryani Darbaar - Menu"
          className="w-14 h-14"
        />
        <h2 className="text-2xl font-bold text-neutral-900">Menu</h2>
      </div>

      {/* My Orders button */}
      <motion.button
        onClick={handleOrdersSelect}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium mb-4 text-neutral-700 hover:bg-red-50 hover:text-primary border border-neutral-200 hover:border-primary transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ClipboardList className="w-5 h-5" />
        My Orders
      </motion.button>

      {/* Categories List */}
      <nav className="flex-1 space-y-2 mb-8">
        {categories.map((category, index) => (
          <motion.button
            key={index}
            onClick={() => handleCategoryClick(category)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
              activeCategory === category
                ? "bg-primary text-white border border-primary"
                : "text-neutral-700 hover:bg-neutral-100 hover:text-primary border border-transparent"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {category}
          </motion.button>
        ))}
      </nav>

      {/* Promotional Card */}
      <PromoCard
        image="/assets/images/order-girl.png"
        imageAlt="Biryani Darbaar - First Order Discount"
        discount="-20%"
        offerTitle="Special Offer"
        offerSubtitle="First Order Discount"
      />
    </motion.aside>
  );
};

export default Sidebar;
