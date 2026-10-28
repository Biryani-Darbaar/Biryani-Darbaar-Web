/** Store badges, dimmed with one caption until the apps are published.
 *  Pass alignment via className, e.g. "items-center lg:items-start". */
const AppStoreBadges: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-col gap-2 ${className}`} role="img" aria-label="Android and iOS apps coming soon">
    <div className="flex items-center gap-4">
      <img src="/assets/images/play-store.png" alt="" className="w-36 md:w-40 opacity-50 grayscale" />
      <img src="/assets/images/app-store.png" alt="" className="w-36 md:w-40 opacity-50 grayscale" />
    </div>
    <p className="text-sm font-semibold text-neutral-700">Our app is coming soon to Android and iOS</p>
  </div>
);

export default AppStoreBadges;
