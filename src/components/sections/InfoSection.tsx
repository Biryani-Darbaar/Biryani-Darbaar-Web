import React from "react";
import { Link } from "react-router-dom";
import { Truck, Phone, Clock, MapPin, ArrowRight } from "lucide-react";
import { BUSINESS, HOURS_WEEK, adelaideWeekday, formatRange } from "@/contents/business";

const CardHeading: React.FC<{ icon: React.ElementType; children: React.ReactNode }> = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-3 mb-6">
    <Icon className="text-primary shrink-0" size={26} strokeWidth={2} />
    <h2 className="text-2xl font-bold text-neutral-900">{children}</h2>
  </div>
);

const InfoPage: React.FC = () => {
  const today = adelaideWeekday();

  return (
    <div className="container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opening hours — one schedule for dine-in, pickup and delivery */}
        <div className="bg-primaryYellow text-neutral-900 p-8 rounded-2xl">
          <CardHeading icon={Clock}>Opening Hours</CardHeading>
          <ul className="space-y-1">
            {HOURS_WEEK.map((d) => {
              const isToday = d.day === today;
              return (
                <li
                  key={d.day}
                  className={`flex justify-between gap-4 rounded-lg px-3 py-2 tabular-nums ${
                    isToday ? "bg-white/70 font-semibold" : ""
                  }`}
                  aria-current={isToday ? "date" : undefined}
                >
                  <span>
                    {d.day}
                    {isToday && <span className="ml-2 hidden sm:inline text-xs font-bold text-primary uppercase tracking-wide">Today</span>}
                  </span>
                  <span className={`whitespace-nowrap ${d.open ? "" : "text-neutral-600"}`}>{formatRange(d)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Delivery & pickup */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 flex flex-col">
          <CardHeading icon={Truck}>Delivery &amp; Pickup</CardHeading>
          <dl className="space-y-4 text-neutral-700">
            <div className="flex justify-between gap-4">
              <dt>Estimated delivery</dt>
              <dd className="font-semibold text-neutral-900">{BUSINESS.deliveryEta}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Minimum order</dt>
              <dd className="font-semibold text-neutral-900">${BUSINESS.minOrder}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Delivery radius</dt>
              <dd className="font-semibold text-neutral-900">Up to 25 km</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Pickup</dt>
              <dd className="font-semibold text-neutral-900">Free</dd>
            </div>
          </dl>
          <Link
            to="/Order"
            className="mt-auto pt-8 inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all"
          >
            Start an order <ArrowRight size={18} />
          </Link>
        </div>

        {/* Contact */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200">
          <CardHeading icon={Phone}>Get in Touch</CardHeading>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            Questions about an order, catering or allergies? Give us a call — we're happy to help.
          </p>
          <a
            href={BUSINESS.phoneHref}
            className="flex items-center gap-3 text-lg font-semibold text-primary hover:underline underline-offset-4"
          >
            <Phone size={18} /> {BUSINESS.phoneDisplay}
          </a>
          <p className="flex items-start gap-3 mt-4 text-neutral-700">
            <MapPin size={18} className="text-primary mt-1 shrink-0" />
            <span>
              {BUSINESS.street}
              <br />
              {BUSINESS.suburb}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
