import AppStoreBadges from "@/components/AppStoreBadges";


const MobileAppSection: React.FC = () => {
    return (
        <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                {/* Left Content */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-4xl md:text-5xl font-bold text-center md:text-left">
                        Ordering is now <span className="text-primary">Easier</span> with <span className="text-primary">Biryani Darbaar App</span><br className="hidden md:block" />
                    </h2>

                    <p className="mt-6 text-base md:text-lg text-neutral-600 text-center md:text-left">
                        Our app is on its way — browse the full menu and order in seconds.
                        Choose pickup or delivery and track your order in real time.
                    </p>

                    <AppStoreBadges className="items-center md:items-start mt-8" />
                </div>
                <div className="hidden md:block left-8 relative md:w-1/2">
                    <img src="/assets/images/mobileappchef.png" alt="Biryani Darbaar - Mobile App" className="w-full h-auto" />
                </div>
            </div>
        </div>
    );
};

export default MobileAppSection;
