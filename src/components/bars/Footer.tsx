import React, { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, LucideIcon } from "lucide-react";
import { footerLinks, socialLinks } from "../../contents/FooterLinks";

const iconMap: Record<"instagram" | "mail" | "phone", LucideIcon> = {
  instagram: Instagram,
  mail: Mail,
  phone: Phone,
};

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

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
            <h4 className="text-xl font-bold mb-6 text-primary">
              Stay Connected
            </h4>
            <p className="text-neutral-600 mb-6 leading-relaxed">
              Subscribe to our newsletter for exclusive updates, delicious
              recipes, and special promotions delivered straight to your inbox.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={handleNewsletterSubmit}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 w-36 rounded-lg bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-red-600 transition-colors border border-primary"
              >
                Subscribe
              </button>
            </form>
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
