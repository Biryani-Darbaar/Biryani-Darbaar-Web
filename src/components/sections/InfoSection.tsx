import React from "react";
import { Truck, Phone, Clock } from "lucide-react";

const InfoPage: React.FC = () => {
  return (
    <div className="container-custom">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Information */}
        <div className="bg-white p-8 rounded-lg border border-neutral-200">
          <div className="flex items-center mb-6">
            <Truck className="text-primary" size={28} strokeWidth={2} />
            <h2 className="text-2xl font-bold text-neutral-900 ml-3">
              Delivery Information
            </h2>
          </div>
          <ul className="text-base text-neutral-700 space-y-3 leading-relaxed">
            <li>
              <strong>Monday:</strong> Closed
            </li>
            <li>
              <strong>Tuesday:</strong>11:00 AM–10:00 PM
            </li>
            <li>
              <strong>Wednesday:</strong>11:00 AM–10:00 PM
            </li>
            <li>
              <strong>Thursday:</strong>11:00 AM–10:00 PM
            </li>
            <li>
              <strong>Friday:</strong>11:00 AM–10:00 PM
            </li>
            <li>
              <strong>Saturday:</strong>11:00 AM–10:00 PM
            </li>
            <li>
              <strong>Sunday:</strong>11:00 AM–10:00 PM
            </li>
          </ul>
          <p className="mt-6 text-base font-bold text-primary">
            Estimated time: 20 min
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-8 rounded-lg border border-neutral-200">
          <div className="flex items-center mb-6">
            <Phone className="text-primary" size={28} strokeWidth={2} />
            <h2 className="text-2xl font-bold text-neutral-900 ml-3">
              Contact Information
            </h2>
          </div>
          <p className="text-base text-neutral-700 mb-6 leading-relaxed">
            If you have any questions or concerns, feel free to reach out to the
            us.
          </p>
          <p className="text-base text-neutral-700 mb-3">
            <strong>Phone:</strong>{" "}
            <a
              href="tel:+61460747490"
              className="text-primary hover:underline font-semibold"
            >
              +61 460 747 490
            </a>
          </p>
          <p className="text-base text-neutral-700">
            <strong>Website:</strong>{" "}
            <a
              href="https://biryanidarbaar.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-semibold"
            >
              biryanidarbaar.com
            </a>
          </p>
        </div>

        {/* Operational Times */}
        <div className="bg-[#f4c145] text-neutral-900 p-8 rounded-lg">
          <div className="flex items-center mb-6">
            <Clock className="text-primary" size={28} strokeWidth={2} />
            <h2 className="text-2xl font-bold text-neutral-900 ml-3">
              Working Hours
            </h2>
          </div>
          <ul className="text-base text-neutral-900 space-y-3 leading-relaxed">
            <li>
              <strong>Monday:</strong>Closed
            </li>
            <li>
              <strong>Tuesday:</strong>11:00 AM–9:00 PM
            </li>
            <li>
              <strong>Wednesday:</strong>11:00 AM–9:00 PM
            </li>
            <li>
              <strong>Thursday:</strong>11:00 AM–9:00 PM
            </li>
            <li>
              <strong>Friday:</strong>11:00 AM–9:00 PM
            </li>
            <li>
              <strong>Saturday:</strong>11:00 AM–9:00 PM
            </li>
            <li>
              <strong>Sunday:</strong>11:00 AM–9:00 PM
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
