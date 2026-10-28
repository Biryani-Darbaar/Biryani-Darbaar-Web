import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin, ArrowUpRight, LucideIcon } from "lucide-react";
import { footerLinks, socialLinks } from "../../contents/FooterLinks";
import { BUSINESS, todayHoursLabel } from "../../contents/business";

const iconMap: Record<"instagram" | "mail" | "phone", LucideIcon> = {
  instagram: Instagram,
  mail: Mail,
  phone: Phone,
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f4c145] text-neutral-900 border-t border-neutral-200">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center md:items-start">
            <img
              src="/assets/images/logo.png"
              alt="Biryani Darbaar - Logo"
              className="h-32 md:h-36 mb-6"
            />
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon: LucideIcon = iconMap[social.icon];
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target={social.icon !== "phone" ? "_blank" : undefined}
                    rel={social.icon !== "phone" ? "noreferrer" : undefined}
                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:bg-primary hover:text-white transition-all"
                    aria-label={social.ariaLabel}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold mb-6 text-primary">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-neutral-900 hover:text-primary transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold mb-6 text-primary">Visit Us</h4>
            <address className="not-italic space-y-3 text-neutral-900">
              <p className="font-semibold">{todayHoursLabel()}</p>
              <p className="flex items-start justify-center md:justify-start gap-2">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span>
                  {BUSINESS.street}, {BUSINESS.suburb}
                </span>
              </p>
              <p>
                <a href={BUSINESS.phoneHref} className="inline-flex items-center gap-2 font-medium hover:text-primary transition-colors">
                  <Phone size={18} className="text-primary" /> {BUSINESS.phoneDisplay}
                </a>
              </p>
              <p>
                <a
                  href={BUSINESS.googleReviewsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:gap-2 transition-all"
                >
                  Get directions <ArrowUpRight size={16} />
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-200 py-6">
        <div className="container-custom">
          <p className="text-center text-neutral-600 text-sm md:text-base">
            &copy; {new Date().getFullYear()} Biryani Darbaar. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
