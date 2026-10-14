import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import {
  Suspense,
  lazy,
  useState,
  useEffect,
  useRef,
  createContext,
} from "react";

import Logo from "../assets/hobitLogo.png";
import NavbarImg from "../assets/navbarimg/navbarimg.png";
import { Link, useSearchParams } from "react-router-dom";

import AppStoreBadge from "../assets/appstore.png";
import PlayStoreBadge from "../assets/playstore.png";
import AppleIcon from "../assets/appleicon.png";
import PlayStoreIcon from "../assets/playstoreicon.png";

import { cmsService } from "../api/services/cms";

import EnquiryModal from "./EnquiryModal";

// Context to manage Enquiry Modal state globally if needed, or just for the header
export const EnquiryModalContext = createContext({
  setIsEnquiryModalOpen: () => {},
});

const navLinks = [
  { label: "Services", href: "/book/service" },

  { label: "How it works", href: "/#how-it-works" },

  { label: "Stories", href: "/#testimonials" },

  { label: "Our Mission", href: "/mission" },

  { label: "FAQ", href: "/#faqs" },

  { label: "Contact", href: "/#contact" },
];

const appLinks = [
  {
    label: "Download on the App Store",

    sublabel: "iOS",

    href: "https://apps.apple.com/in/app/hobit/id6761460845",

    badge: AppStoreBadge,

    icon: AppleIcon,

    iconClass: "brightness-0 invert",
  },

  {
    label: "Get it on Google Play",

    sublabel: "Android",

    href: "https://play.google.com/store/apps/details?id=com.hobit.hobitt&pcampaignid=web_share",

    badge: PlayStoreBadge,

    icon: PlayStoreIcon,

    iconClass: "",
  },
];

// Download pill - direct App Store / Play Store icon links

const DownloadMenu = () => (
  <div className="flex items-center gap-2 rounded-full bg-[#050509] px-3 py-2 shadow-lg shadow-black/10 transition-colors hover:bg-[#1c1c22] sm:gap-3 sm:px-4">
    <span className="hidden text-sm font-medium text-white sm:inline">
      Download App:
    </span>

    {appLinks.map(({ label, sublabel, href, icon, iconClass }, index) => (
      <div key={sublabel} className="flex items-center gap-2 sm:gap-3">
        {index > 0 && <span className="h-4 w-px bg-white/25" />}

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          aria-label={label}
          className="flex items-center transition hover:scale-110"
        >
          <img
            src={icon}
            alt={label}
            className={`h-5 w-5 object-contain ${iconClass}`}
            loading="lazy"
          />
        </a>
      </div>
    ))}
  </div>
);

// Marquee Component - Professional, always visible and sticky

const ComingSoonMarquee = ({ onMarqueeClick }) => {
  const [text, setText] = useState("Coming Soon In Nashik");

  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await cmsService.getHeaderData();

        const data = res?.data || res;

        if (!isMounted || !data) return;

        setText(data.marquee_text || "Coming Soon In Nashik");

        setEnabled(Boolean(data.marquee_status));
      } catch {
        // keep defaults on error
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!enabled) return null;

  const marqueeItems = Array(7).fill(text);

  const handleClick = () => {
    onMarqueeClick?.();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#3d8bff] border-b border-white/10 overflow-hidden">
      <div className="relative flex items-center h-10 sm:h-10 min-h-[2.5rem] m-1">
        {/* Gradient fade edges - mask so marquee doesn't visibly cut at edges */}

        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#3d8bff] to-transparent z-10 pointer-events-none" />

        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#3d8bff] to-transparent z-10 pointer-events-none" />

        {/* Marquee track */}

        {/* <button

          type="button"

          onClick={handleClick}

          className="marquee-track flex items-center gap-4 sm:gap-8 cursor-pointer"

        >

          {[...marqueeItems, ...marqueeItems].map((item, index) => (

            <div key={index} className="flex items-center gap-3 sm:gap-4">

              <span className="inline-flex items-center justify-center px-4 py-1.5 sm:px-6 sm:py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-[10px] sm:text-sm font-semibold text-white shadow-sm shadow-black/20 transition-all whitespace-nowrap">

                {item}

              </span>

              <span className="text-[#000104] text-xs sm:text-sm">✦</span>

            </div>

          ))}

        </button> */}

        <button
          type="button"
          onClick={handleClick}
          className="marquee-track flex items-center gap-6 sm:gap-10 cursor-pointer py-1"
        >
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 sm:gap-4 flex-shrink-0"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full

                       bg-gradient-to-r from-white/15 via-white/5 to-transparent

                       border border-white/25 shadow-[0_0_18px_rgba(0,0,0,0.35)]

                       hover:from-white/25 hover:via-white/10 hover:to-transparent

                       text-[10px] sm:text-sm font-semibold text-white

                       backdrop-blur-sm transition-all whitespace-nowrap flex-shrink-0"
              >
                {/* <img
                  src={NavbarImg}
                  alt="Hobit logo"
                  className="h-5 w-auto object-contain flex-shrink-0"
                /> */}
                <span>{item}</span>
              </span>

              <span className="text-white/60 text-xs sm:text-sm flex-shrink-0">
                ✦
              </span>
            </div>
          ))}
        </button>
      </div>
    </div>
  );
};

function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(true);

  const [user, setUser] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(
    () => searchParams.get("enquiry") === "open",
  );

  useEffect(() => {
    if (searchParams.get("enquiry") === "open") {
      const nextParams = new URLSearchParams(searchParams);

      nextParams.delete("enquiry");

      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const lastScrollY = useRef(0);

  const isAutoScrolling = useRef(false);

  useEffect(() => {
    // Check for user token and details on mount and storage change

    const checkUser = () => {
      const token = localStorage.getItem("token");

      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      } else if (token) {
        // Fallback if user object isn't saved but token is

        setUser({ name: "User" });
      } else {
        setUser(null);
      }
    };

    checkUser();

    window.addEventListener("storage", checkUser);

    // Custom event listener for login updates

    window.addEventListener("login-success", checkUser);

    window.addEventListener("logout", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);

      window.removeEventListener("login-success", checkUser);

      window.removeEventListener("logout", checkUser);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling.current) return;

      const current = window.scrollY;

      const last = lastScrollY.current;

      if (current > last + 10 && current > 50) {
        setIsVisible(false);
      } else if (current < last - 10) {
        setIsVisible(true);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = (e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();

      isAutoScrolling.current = true;

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 800);
    }
  };

  const handleNavClick = (href) => {
    isAutoScrolling.current = true;

    setIsVisible(true);

    setIsMobileOpen(false);

    setTimeout(() => {
      isAutoScrolling.current = false;
    }, 1000);
  };

  const workerProfileData = (() => {
    try {
      const raw = localStorage.getItem("worker_profile_data");

      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  const displayName =
    user && user.role === "partner"
      ? workerProfileData.fullName || user.name || "User"
      : user?.name || "User";

  const firstName = String(displayName).trim().split(" ")[0] || "User";

  const nameInitial = firstName.charAt(0).toUpperCase() || "U";

  return (
    <EnquiryModalContext.Provider value={{ setIsEnquiryModalOpen }}>
      <ComingSoonMarquee onMarqueeClick={() => setIsEnquiryModalOpen(true)} />

      <div
        id="top"
        className={`fixed top-9 inset-x-0 z-50 pt-3 pointer-events-none transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-[calc(100%+36px)]"
        }`}
      >
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center px-4 sm:px-6">
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-auto flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white/90 px-4 py-2 text-sm text-[#050509] shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <Link to="/" onClick={scrollToTop}>
                <img
                  src={Logo}
                  alt="Hobit1"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            <div className="hidden flex-1 items-center justify-center gap-6 sm:flex md:gap-8">
              {navLinks.map((link) => {
                // Check if it's an internal route or anchor link

                if (
                  link.href.startsWith("/book") ||
                  link.href.startsWith("/mission")
                ) {
                  return (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="relative text-base font-medium tracking-wide text-zinc-700 transition hover:text-[#3d8bff]"
                    >
                      {link.label}
                    </Link>
                  );
                } else {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="relative text-base font-medium tracking-wide text-zinc-700 transition hover:text-[#3d8bff]"
                    >
                      {link.label}
                    </a>
                  );
                }
              })}
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to={user.role === "partner" ? "/worker" : "/dashboard"}>
                    <div className="w-8 h-8 rounded-full bg-[#3d8bff]/10 flex items-center justify-center text-[#3d8bff] font-semibold text-sm">
                      {nameInitial}
                    </div>
                  </Link>

                  <span className="text-sm font-medium text-zinc-700">
                    {firstName}
                  </span>
                </div>
              )}

              <DownloadMenu />

              <button
                type="button"
                onClick={() => setIsMobileOpen((open) => !open)}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm sm:hidden"
              >
                <span className="sr-only">Toggle navigation</span>

                <span
                  className={`block h-[2px] w-4 rounded-full bg-zinc-900 transition ${
                    isMobileOpen
                      ? "translate-y-[2px] rotate-45"
                      : "-translate-y-[3px]"
                  }`}
                />

                <span
                  className={`block h-[2px] w-4 rounded-full bg-zinc-900 transition ${
                    isMobileOpen
                      ? "-translate-y-[2px] -rotate-45"
                      : "translate-y-[3px]"
                  }`}
                />
              </button>
            </div>
          </motion.nav>

          {isMobileOpen && (
            <div className="pointer-events-auto mt-2 flex w-full flex-col gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs sm:hidden">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  // Check if it's an internal route or anchor link

                  if (
                    link.href.startsWith("/book") ||
                    link.href.startsWith("/mission")
                  ) {
                    return (
                      <Link
                        key={link.label}
                        to={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className="rounded-full px-3 py-2 text-[11px] font-medium tracking-wide text-zinc-700 transition hover:bg-zinc-100 hover:text-[#3d8bff]"
                      >
                        {link.label}
                      </Link>
                    );
                  } else {
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className="rounded-full px-3 py-2 text-[11px] font-medium tracking-wide text-zinc-700 transition hover:bg-zinc-100 hover:text-[#3d8bff]"
                      >
                        {link.label}
                      </a>
                    );
                  }
                })}

                {user && (
                  <Link
                    to={user.role === "partner" ? "/worker" : "/dashboard"}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 rounded-full px-3 py-2 text-[11px] font-medium tracking-wide text-zinc-700 transition hover:bg-zinc-100 hover:text-[#3d8bff]"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#3d8bff]/10 flex items-center justify-center text-[#3d8bff] font-bold text-[10px]">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <span>Dashboard</span>
                  </Link>
                )}

                <div className="mt-1 flex flex-col gap-1.5 border-t border-zinc-200 px-1 pt-2">
                  {appLinks.map(({ label, sublabel, href, badge }) => (
                    <a
                      key={sublabel}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileOpen(false)}
                      className="block w-40 overflow-hidden rounded-lg transition hover:opacity-80"
                    >
                      <img
                        src={badge}
                        alt={label}
                        className="block h-auto w-full"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </EnquiryModalContext.Provider>
  );
}

export default Navbar;
