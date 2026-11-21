import { Link } from "react-router-dom";
import { Info, PauseCircle, Phone } from "lucide-react";
import { BUSINESS, todayHoursLabel } from "@/contents/business";

/** Shown wherever ordering happens while the admin has online ordering switched off. */
const OrderingPausedNotice = ({ compact = false, showMenuLink = false }: { compact?: boolean; showMenuLink?: boolean }) => (
  <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
    <div className="flex items-start gap-3">
      <PauseCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
      <div className="space-y-1.5">
        <p className="font-semibold text-base">We're not taking online orders right now</p>
        <p className="text-sm text-amber-900">
          Online ordering is paused for the moment. {!compact && "You can still browse the menu, and we'll be back soon. "}
          {todayHoursLabel()}.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm font-semibold">
          <a href={BUSINESS.phoneHref} className="inline-flex items-center gap-1.5 text-red-700 hover:underline">
            <Phone className="h-4 w-4" aria-hidden /> Call {BUSINESS.phoneDisplay}
          </a>
          {showMenuLink && <Link to="/Menu" className="text-red-700 hover:underline">View the menu</Link>}
        </div>
      </div>
    </div>
  </div>
);

/** Shown while ordering is on but the admin has switched off pickup or delivery. */
export const MethodPausedNotice = ({ pickup, delivery, className = "" }: { pickup: boolean; delivery: boolean; className?: string }) => {
  if (pickup === delivery) return null;
  const [on, off] = pickup ? ["Pickup", "delivery"] : ["Delivery", "pickup"];
  return (
    <p role="status" className={`flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 ${className}`}>
      <Info className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <span><strong className="font-semibold">{on} only right now.</strong> We're not taking {off} orders at the moment.</span>
    </p>
  );
};

export default OrderingPausedNotice;
