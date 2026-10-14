import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../assets/hobitLogo.png";
import FacebookIcon from "../assets/fb1.png";
import LinkdinIcon from "../assets/lindin1.png";
import Insta from "../assets/insta1.png";
import X from "../assets/x-removebg-preview.png";
import StartUp from "../assets/start_logo.png";
import { hobit1Categories } from "../data/hobit1Services";

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="border-t border-zinc-200 bg-white"
    >
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img
                src={Logo}
                alt="Hobit1 Logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-zinc-600">
              India&apos;s most trusted on-demand home service platform.
            </p>

            <img
              src={StartUp}
              alt="Startup India"
              className="h-18 w-auto object-contain sm:h-16 md:h-18 "
            />
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/hobit.club/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-9 w-9 overflow-hidden rounded-full border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={Insta}
                  alt="Instagram"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </a>
              <a
                href="https://www.facebook.com/hobitclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-9 w-9 overflow-hidden rounded-full border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={FacebookIcon}
                  alt="Facebook"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </a>
              <a
                href="https://www.linkedin.com/in/hobit-571ab53a6/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-9 w-9 overflow-hidden rounded-full border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={LinkdinIcon}
                  alt="LinkedIn"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </a>
              <a
                href="https://x.com/hobitclub"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-9 w-9 overflow-hidden rounded-full border border-zinc-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={X}
                  alt="X"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Company
            </p>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              <li>
                <Link to="/about-us" className="hover:text-[#3d8bff]">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-[#3d8bff]">
                  Careers
                </Link>
              </li>
              {/* <li>
                <a href="#" className="hover:text-[#3d8bff]">
                  Blog
                </a>
              </li> */}
              <li>
                <Link to="/delete-account" className="hover:text-zinc-900">
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Services
            </p>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              {/* OLD cleaning-only service links (pre-Hobit1) — not used.
              <li>
                <Link
                  to="/book/service"
                  state={{ category: "instant_help" }}
                  className="hover:text-[#3d8bff]"
                >
                  Instant Help
                </Link>
              </li>
              <li>
                <Link
                  to="/book/service"
                  state={{ category: "instant_cook" }}
                  className="hover:text-[#3d8bff]"
                >
                  Instant Cook
                </Link>
              </li>
              <li>
                <Link
                  to="/book/service"
                  state={{ category: "monthly_subscription" }}
                  className="hover:text-[#3d8bff]"
                >
                  Hobit Everyday
                </Link>
              </li>
              <li>
                <Link
                  to="/book/service"
                  state={{ category: "_hobit_weekday" }}
                  className="hover:text-[#3d8bff]"
                >
                  Hobit Weekday
                </Link>
              </li>
              <li>
                <Link
                  to="/book/service"
                  state={{ category: "monthly_cook" }}
                  className="hover:text-[#3d8bff]"
                >
                  Monthly Cook
                </Link>
              </li>
              */}
              {hobit1Categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to="/book/service"
                    state={{ category: cat.slug }}
                    className="hover:text-[#3d8bff]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Contact
            </p>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li>
                <span>+91 72619 59596</span>
              </li>
              <li>
                <a
                  href="mailto:support@hobit.com"
                  className="hover:text-[#3d8bff]"
                >
                  hobitkpl@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@hobit.com"
                  className="hover:text-[#3d8bff]"
                >
                  support@hobit.club
                </a>
              </li>
              <li>
                <span>Nashik, Maharashtra</span>
              </li>
            </ul>
          </div>

          {/* Company Registration Details */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                KPLONE & COMPANY PVT. LTD.
              </p>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-600 mt-2.5">
                <p>An ISO 9001:2015 Certified Company</p>
                <p>
                  Company registered under Government of India Ministry of
                  Corporate Affairs
                </p>
                <p>(U97000MH2025PTC461826)</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-900">
                Registered Office Address
              </p>
              <p className="text-sm text-zinc-600">
                Shop No. 236, Second Floor, Roongta Fururex, Opp. Hotel The One,
                Near R.D Circle, City Center Mall Road, Govind Nagar,
                Nashik-422008
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} KPLONE & COMPANY PRIVATE LIMITED. All
            Rights Reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-zinc-900">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-zinc-900">
              Terms & Conditions
            </Link>
            <Link to="/refund-policy" className="hover:text-zinc-900">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
