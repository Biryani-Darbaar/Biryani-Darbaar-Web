// Orders.tsx
import LargeImageView from "@/components/LargeImageView";
import OrderSection from "@/components/sections/order/OrderSection";
import InfoPage from "@/components/sections/InfoSection";
import LocationInfo from "@/components/sections/LocationSection";
import { motion } from "framer-motion";

// No local CartProvider — uses the App-level CartProvider so cart state is
// shared with Checkout.tsx. Adding one here would create an isolated cart
// instance invisible to the rest of the app.
const Order = () => {
  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* Hero + menu order section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Same wrapper used by Menu page — provides section-spacing top-padding
            that pushes the hero below the fixed navbar, plus container-custom
            for max-width and horizontal padding. */}
        <div className="container-custom section-spacing mt-12">
          <LargeImageView
            title="Biryani in Australia"
            description="The rich flavors of Hyderabad biryani"
          />
        </div>
        <OrderSection />
      </motion.div>

      {/* Info cards */}
      <InfoPage />

      {/* Find Us Here — now receives proper gap spacing from parent flex */}
      <LocationInfo />
    </div>
  );
};

export default Order;
