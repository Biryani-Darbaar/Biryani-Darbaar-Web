import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { categoriesAPI, dishesAPI } from "@/apis";
import ArchedCard from "@/components/cards/ArchedCard";
import LargeImageView from "@/components/LargeImageView";
import InfoPage from "@/components/sections/InfoSection";
import CustomerReviews from "@/components/sections/CustomerReviewSection";
import DiscountSection from "@/components/sections/DiscountSection";
import InputSearch from "@/components/InputSearch";
import Loading from "@/components/Loading";
import ErrorFallback from "@/components/ErrorFallback";

interface Dish {
    image: string;
    dishName?: string;
    name?: string;
    description?: string;
    price: number;
}

const Menu = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingDishes, setIsLoadingDishes] = useState(false);
    const [categoryError, setCategoryError] = useState(false);
    const [dishesError, setDishesError] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const location = useLocation();
    const categoryBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            setCategoryError(false);
            try {
                const data = await categoriesAPI.getCategories();
                setCategories(data);
                if (data.length > 0) setActiveCategory(data[0]);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategoryError(true);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const [dishes, setDishes] = useState<{ [key: string]: Dish[] }>({});

    useEffect(() => {
        const fetchDishes = async () => {
            setIsLoadingDishes(true);
            setDishesError(false);
            const dishesData: { [key: string]: Dish[] } = {};
            let hasError = false;
            for (const category of categories) {
                try {
                    const data = await dishesAPI.getDishesByCategory(category);
                    dishesData[category] = data;
                } catch (error) {
                    console.error(`Error fetching data for category ${category}:`, error);
                    hasError = true;
                }
            }
            setDishes(dishesData);
            setDishesError(hasError);
            setIsLoadingDishes(false);
        };
        if (categories.length > 0) fetchDishes();
    }, [categories]);

    // ── Real-time dish filter ──────────────────────────────────────────────────
    const getFilteredDishes = useCallback(
        (category: string): Dish[] => {
            const all = dishes[category] ?? [];
            if (!searchQuery.trim()) return all;
            const q = searchQuery.toLowerCase();
            return all.filter(
                (d) =>
                    (d.dishName ?? d.name ?? "").toLowerCase().includes(q) ||
                    (d.description ?? "").toLowerCase().includes(q),
            );
        },
        [dishes, searchQuery],
    );

    // Only show categories that have matching dishes when filtering
    const visibleCategories = searchQuery.trim()
        ? categories.filter((cat) => getFilteredDishes(cat).length > 0)
        : categories;

    // ── Category scroll-spy ───────────────────────────────────────────────────
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const category of categories) {
                const element = document.getElementById(category);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveCategory(category);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [categories]);

    // ── Search: scroll to matching category or highlight dishes ──────────────
    const handleSearch = useCallback(
        (query: string) => {
            if (!query.trim()) return;
            // Try exact category match first
            const category = categories.find((cat) =>
                cat.toLowerCase().includes(query.toLowerCase()),
            );
            if (category) {
                setActiveCategory(category);
                const element = document.getElementById(category);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
                return;
            }
            // Fall back to scrolling to first category with a dish name match
            for (const cat of categories) {
                const match = (dishes[cat] ?? []).find(
                    (d) =>
                        (d.dishName ?? d.name ?? "")
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                );
                if (match) {
                    setActiveCategory(cat);
                    const element = document.getElementById(cat);
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                    break;
                }
            }
        },
        [categories, dishes],
    );

    // Handle search param from URL (e.g. /menu?search=biryani)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQueryParam = params.get("search");
        if (searchQueryParam) handleSearch(searchQueryParam);
    }, [location.search, handleSearch]);

    return (
        <div className="flex flex-col gap-16 md:gap-24">
            {/* ── Hero + Search + Categories ─────────────────────────── */}
            <div className="container-custom section-spacing mt-12">
                <LargeImageView
                    title="Biryani Darbaar in Athol Park"
                    description="Enjoy authentic biryani with fresh ingredients!"
                />

                {/* Search bar */}
                <div className="flex justify-center mt-8 mb-10">
                    <InputSearch
                        placeholder="Search categories or dishes…"
                        onSearch={handleSearch}
                        onQueryChange={setSearchQuery}
                    />
                </div>

                {/* Category pills */}
                {isLoadingCategories ? (
                    <Loading text="Loading categories…" />
                ) : categoryError ? (
                    <ErrorFallback
                        message="Failed to load categories"
                        onRetry={() => window.location.reload()}
                    />
                ) : (
                    <div
                        ref={categoryBarRef}
                        className="flex flex-wrap justify-center gap-2.5"
                    >
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setActiveCategory(category);
                                    setSearchQuery("");
                                    const element = document.getElementById(category);
                                    if (element)
                                        element.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                }}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
                                    activeCategory === category
                                        ? "bg-primary text-white border-primary shadow-md"
                                        : "bg-white text-neutral-700 border-neutral-300 hover:border-primary hover:text-primary"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Dishes Section ─────────────────────────────────────── */}
            <div className="container-custom">
                {isLoadingDishes ? (
                    <Loading text="Loading delicious dishes…" />
                ) : dishesError ? (
                    <ErrorFallback
                        message="Failed to load dishes"
                        onRetry={() => window.location.reload()}
                    />
                ) : visibleCategories.length === 0 && searchQuery.trim() ? (
                    /* Empty search result */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-5xl mb-4">🍽️</p>
                        <p className="text-xl font-semibold text-neutral-700 mb-2">
                            No dishes found for &ldquo;{searchQuery}&rdquo;
                        </p>
                        <p className="text-neutral-500">
                            Try a different keyword or browse by category above.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {visibleCategories.map((category: string) => (
                            <div key={category}>
                                <h2
                                    id={category}
                                    className="text-3xl md:text-4xl font-bold text-primary mb-8 scroll-mt-28"
                                >
                                    {category}
                                    {searchQuery.trim() && (
                                        <span className="ml-3 text-base font-normal text-neutral-500">
                                            {getFilteredDishes(category).length} result
                                            {getFilteredDishes(category).length !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {getFilteredDishes(category).map((dish, index) => (
                                        <ArchedCard
                                            key={index}
                                            image={dish.image}
                                            title={dish.dishName ?? dish.name ?? "Delicious Dish"}
                                            description={dish.description ?? "Delicious dish"}
                                            buttonTitle="Order Now"
                                            price={`$${dish.price}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Discount Section (AFTER dishes, per spec) ──────────── */}
            <DiscountSection />

            <InfoPage />
            <CustomerReviews />
        </div>
    );
};

export default Menu;
