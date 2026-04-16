import LargeImageView from "@/components/LargeImageView";
import ArchedCard from "@/components/cards/ArchedCard";
import { useEffect, useState } from "react";
import { dishesAPI } from "@/apis";
import Loading from "@/components/Loading";

const SpecialOffer = () => {
    interface Dish {
        image: string;
        name?: string;
        dishName?: string;
        description?: string;
        price: number;
    }

    const [dishes, setDishes] = useState<Dish[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                const data = await dishesAPI.getSpecialOffers();
                setDishes(data);
            } catch (error) {
                console.error("Error fetching dishes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDishes();
    }, []);

    return (
        <div className="flex flex-col gap-16 md:gap-24">
            {/* Hero */}
            <div className="container-custom section-spacing mt-12">
                <LargeImageView
                    title="Special Offers"
                    description="Discover our exclusive deals and limited-time promotions on your favourite dishes."
                />
            </div>

            {/* Dish grid */}
            <div className="container-custom">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Today&apos;s <span className="text-primary">Special</span> Offers
                    </h1>
                    <p className="text-neutral-500 mt-3 text-lg">
                        Limited-time dishes made with love — order before they&apos;re gone!
                    </p>
                </div>

                {loading ? (
                    <Loading text="Loading special offers…" />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dishes.map((dish, index) => (
                            <ArchedCard
                                key={index}
                                image={dish.image}
                                title={dish.dishName ?? dish.name ?? "Delicious Dish"}
                                description={dish.description ?? "Delicious dishes"}
                                buttonTitle="Order Now"
                                price={`$${dish.price.toString()}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpecialOffer;
