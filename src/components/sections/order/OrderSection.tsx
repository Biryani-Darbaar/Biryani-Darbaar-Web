// OrderSection.tsx
import React, { useState, useEffect } from "react";
import MenuCard from "@/components/cards/MenuCard";
import Sidebar from "@/components/bars/MenuBar";
import Loading from "@/components/Loading";
import ErrorFallback from "@/components/ErrorFallback";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { dishesAPI } from "@/apis";
import { MenuItem } from "@/types";

const OrderSection: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<string>("Biryani Specials");
  const navigate = useNavigate();

  const handleCategorySelect = async (category: string) => {
    setActiveCategory(category);
    setLoading(true);
    setError(false);
    try {
      const data = await dishesAPI.getDishesByCategory(category);
      const menuItems = data.map((item) => ({
        dishId: item.dishId || "",
        name: item.name || item.dishName || "Delicious Dish",
        description: item.description || "",
        image: item.image || "",
        price: item.price || 0,
        addons: item.addons || [],
      }));
      setMenuItems(menuItems);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to the dedicated Order History page instead of rendering inline
  const handleOrdersSelect = () => {
    navigate("/order-history");
  };

  // Called by Sidebar before switching category — kept for interface compatibility
  const handleClearOrders = () => {};

  useEffect(() => {
    handleCategorySelect("Biryani Specials");
  }, []);

  return (
    <div className="container-custom">
      <motion.div
        className="flex flex-col md:flex-row py-20 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Sidebar
          handleCategorySelect={handleCategorySelect}
          handleOrdersSelect={handleOrdersSelect}
          handleClearOrders={handleClearOrders}
          activeCategory={activeCategory}
        />

        <div className="flex-1 flex flex-col">
          <motion.div
            className="flex-1 p-6 lg:p-12 rounded-2xl border"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="">
              <h1 className="text-3xl md:text-4xl font-bold mb-8 text-neutral-900 ">
                Order from Biryani Darbaar
              </h1>
              {loading ? (
                <Loading text="Loading delicious dishes..." />
              ) : error ? (
                <ErrorFallback
                  message="Failed to load dishes"
                  onRetry={() => handleCategorySelect(activeCategory)}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.dishId || String(index)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <MenuCard
                        dishId={item.dishId}
                        title={item.name}
                        description={item.description}
                        imageUrl={item.image}
                        price={item.price}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSection;
