import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// import HeroVisual from "../../assets/Man-Women.webp"; // Hobit1: replaced by /images/home.png
import AppStoreLogo from "../../assets/appstore.png";
import PlayStoreLogo from "../../assets/playstore.png";
import { cmsService } from "../../api/services/cms";
// import { getImageUrl } from "../../config/mediaUrls"; // Hobit1: CMS hero image not used

function HeroSection() {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    setIsMuted(video.muted);
  };

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await cmsService.getHeroData();
        if (response.success && response.data) {
          setHeroData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Helper function to process description with line breaks
  // Used by the old CMS description only (commented out for Hobit1).
  // eslint-disable-next-line no-unused-vars
  const renderDescription = (desc) => {
    if (!desc) return null;
    // Replace \r\n and </br> with <br /> logic
    return desc.split(/\\r\\n|<\/br>|<br\s*\/?>/i).map((part, index) => (
      <span key={index}>
        {part}
        {index < desc.split(/\\r\\n|<\/br>|<br\s*\/?>/i).length - 1 && <br />}
      </span>
    ));
  };

  const rawCities = heroData?.available_in || ["Nashik"];

  const { activeCities, comingSoonCities } = (() => {
    const active = [];
    const soon = [];
    rawCities.forEach((entry) => {
      const parts = entry.split("|").map((s) => s.trim()).filter(Boolean);
      parts.forEach((part) => {
        if (part.toLowerCase().includes("launching soon")) return;
        if (entry === rawCities[0] && !entry.includes("|")) {
          active.push(part);
        } else {
          soon.push(part);
        }
      });
    });
    return { activeCities: active, comingSoonCities: soon };
  })();

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hobit1: wider image column for the 6-professional hero image (was 1.2fr / 1fr) */}
      <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {/* Hobit1: old CMS heading ("House Help, Without the Uncertainty") not used */}
              {/* {heroData?.heading || "House Help, Without the Uncertainty"} */}
              Home Services, Without the Uncertainty
            </h1>
            <p className="text-balance text-base leading-relaxed text-zinc-600 sm:text-base">
              {/* Hobit1: old CMS description (cleaning-only) not used */}
              {/* {heroData ? renderDescription(heroData.description) : ...} */}
              <>
                Cleaning, pest control, painting, electrical, plumbing and
                carpentry — one app, verified professionals, fixed prices.
                <br />
                <br />
                Hobit1 brings structure, reliability, and calm to every home
                in Nashik.
              </>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={heroData?.button_primary_link || "/book"}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#3d8bff] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#3d8bff]/40 transition hover:-translate-y-0.5 hover:bg-[#3f5ce6] hover:shadow-lg"
            >
              {/* {heroData?.button_primary_text || "Book house help"} */}
              Book a service
              <span className="text-lg">↗</span>
            </Link>
            <a
              href={heroData?.button_secondary_link || "#how-it-works"}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-[#3d8bff] hover:bg-[#3d8bff]/5"
            >
              {/* {heroData?.button_secondary_text || "See how Hobit works"} */}
              See how Hobit1 works
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.hobit.hobitt&pcampaignid=web_share"
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden rounded-xl transition hover:scale-105 active:scale-95"
            >
              <img
                src={PlayStoreLogo}
                alt="Get it on Google Play"
                className="h-14 w-auto"
              />
            </a>
            <a
              href="https://apps.apple.com/in/app/hobit/id6761460845"
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden rounded-xl transition hover:scale-105 active:scale-95"
            >
              <img
                src={AppStoreLogo}
                alt="Download on the App Store"
                className="h-14 w-auto"
              />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              Available in
            </p>
            <div className="flex flex-wrap gap-2">
              {activeCities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm font-medium text-white"
                >
                  {city}
                </span>
              ))}
              {comingSoonCities.length > 0 && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Launching Soon
                </span>
              )}
              {comingSoonCities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-600"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-[#3d8bff]/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl bg-white ">
            {/* Hobit1: hero video replaces the static image. Browsers only allow
                muted autoplay, so the button below turns the voice on. */}
            {/* <img src="/images/home.png" alt="..." className="h-full w-full object-cover" /> */}
            <video
              ref={videoRef}
              src="/images/gemini_generated_video_ff691512.mp4"
              poster="/images/home.png"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Hobit1 professionals for cleaning, pest control, painting, electrical, plumbing and carpentry in Nashik"
              // Hobit1: slight zoom from top-left crops the Gemini/Veo mark in the bottom-right corner
              className="h-full w-full origin-top-left scale-[1.12] object-cover"
            />
            <button
              type="button"
              onClick={toggleSound}
              className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur transition hover:bg-black/85"
            >
              {isMuted ? "🔇 Tap for sound" : "🔊 Sound on"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
