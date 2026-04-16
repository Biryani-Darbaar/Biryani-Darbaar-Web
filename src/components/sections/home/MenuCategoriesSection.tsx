import RedButton from "@/components/atoms/RedButton";
import ArchedCard from "@/components/cards/ArchedCard";
import Loading from "@/components/Loading";
import ErrorFallback from "@/components/ErrorFallback";
import { MenuCategoriesSectionProps } from "@/types";

const MenuCategoriesSection: React.FC<MenuCategoriesSectionProps> = ({
    categories,
    activeCategory,
    setActiveCategory,
    dishes,
    loading = false,
    error = false,
    onRetry,
}) => {
    // Ensure categories and dishes are always arrays
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeDishes = Array.isArray(dishes) ? dishes : [];

    return (
        <div className="container-custom">
            <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold">
                    <span className="text-primary">Menu</span> that{" "}
                    <span className="text-primary">Always</span> makes you <br />
                    Fall in <span className="text-primary">Love</span>
                </h2>
            </div>

            {/* Category Buttons */}
            <div className="flex overflow-x-auto md:flex-wrap md:justify-center gap-4 mt-12">
                {safeCategories.length > 0 ? (
                    safeCategories.map((category, index) => (
                        <RedButton
                            key={index}
                            className="w-60 flex-shrink-0"
                            name={category}
                            variant={activeCategory === category ? "active" : "inactive"}
                            onClick={() => {
                                setActiveCategory(category);
                                console.log("Category clicked:", category);
                            }}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No categories available.</p>
                )}
            </div>

            {/* Dishes Section */}
            <div className="mt-14">
                <h3 className="text-4xl font-bold text-center">
                    {activeCategory}
                </h3>

                {loading ? (
                    <Loading text="Loading dishes..." />
                ) : error ? (
                    <ErrorFallback
                        message="Failed to load dishes"
                        onRetry={onRetry}
                    />
                ) : safeDishes.length > 0 ? (
                    <>
                        {/* Mobile scrolling */}
                        <div className="flex overflow-x-auto gap-6 mt-8 lg:hidden">
                            {safeDishes.map((dish, index) => (
                                <div key={index} className="min-w-[270px]">
                                    <ArchedCard
                                        image={dish.image}
                                        title={dish.dishName || dish.name || "Delicious Dish"}
                                        description={
                                            dish.description || "Delicious dish available now!"
                                        }
                                        buttonTitle="Order Now"
                                        price={`$${dish.price}`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Desktop grid */}
                        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mt-8">
                            {safeDishes.map((dish, index) => (
                                <ArchedCard
                                    key={index}
                                    image={dish.image}
                                    title={dish.dishName || dish.name || "Delicious Dish"}
                                    description={
                                        dish.description || "Delicious dish available now!"
                                    }
                                    buttonTitle="Order Now"
                                    price={`$${dish.price}`}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-5xl mb-4">🍽️</p>
                        <p className="text-neutral-500 text-lg font-medium">
                            No dishes available in this category yet.
                        </p>
                        <p className="text-neutral-400 text-sm mt-1">
                            Check back soon!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuCategoriesSection;
