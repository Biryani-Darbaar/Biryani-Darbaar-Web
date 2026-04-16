import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesAPI, dishesAPI, mediaAPI } from "@/apis";
import CustomerReviews from "@/components/sections/CustomerReviewSection";
import LocationInfo from "@/components/sections/LocationSection";
import HeroSection from "@/components/sections/home/HeroSection";
import SpecialOffersSection from "@/components/sections/home/SpecialOffersSection";
import ServicesSection from "@/components/sections/home/ServicesSection";
import MenuCategoriesSection from "@/components/sections/home/MenuCategoriesSection";
import MobileAppSection from "@/components/sections/home/MobileAppSection";
import InfoPage from "@/components/sections/InfoSection";
import { Dish } from "@/types";
import type { SpecialMediaItem } from "@/apis/media";

const Home = () => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();

    const intervalId = setInterval(fetchCategories, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const [activeCategory, setActiveCategory] =
    useState<string>("Biryani Specials");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isDishesLoading, setIsDishesLoading] = useState(false);

  useEffect(() => {
    const fetchDishes = async () => {
      setIsDishesLoading(true);
      try {
        const data = await dishesAPI.getDishesByCategory(activeCategory);
        setDishes(data);
      } catch (error) {
        console.error("Error fetching dishes:", error);
        setDishes([]);
      } finally {
        setIsDishesLoading(false);
      }
    };

    fetchDishes();
    const intervalId = setInterval(fetchDishes, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(intervalId);
  }, [activeCategory]);

  const [specialDishes, setSpecialDishes] = useState<Dish[]>([]);
  const [mediaItems, setMediaItems]       = useState<SpecialMediaItem[]>([]);

  useEffect(() => {
    // Fetch admin-uploaded special offer media first; fall back to dishes
    const fetchMedia = async () => {
      try {
        const data = await mediaAPI.getSpecialOfferMedia();
        if (data.length > 0) {
          setMediaItems(data);
        } else {
          // No media uploaded — show special offer dishes as before
          const dishes = await dishesAPI.getSpecialOffers();
          setSpecialDishes(dishes);
        }
      } catch {
        try {
          const dishes = await dishesAPI.getSpecialOffers();
          setSpecialDishes(dishes);
        } catch {
          // silent — empty state shown
        }
      }
    };

    fetchMedia();
  }, []);

  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/menu?search=${query}`);
  };

  return (
    <div className="flex flex-col gap-20 md:gap-28">
      <HeroSection onSearch={handleSearch} />
      <SpecialOffersSection specialDishes={specialDishes} mediaItems={mediaItems} />
      <ServicesSection />
      <MenuCategoriesSection
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        dishes={dishes}
        loading={isDishesLoading}
      />
      <MobileAppSection />
      <LocationInfo />
      <InfoPage />
      <CustomerReviews />
    </div>
  );
};

export default Home;
