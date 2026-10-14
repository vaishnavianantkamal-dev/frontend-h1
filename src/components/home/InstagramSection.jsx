import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const INSTAGRAM_URL = "https://www.instagram.com/hobit.club/";

// TODO: Replace these with real Hobit post permalinks.
// Open a post on instagram.com, copy its URL, and paste it here (keep the trailing slash).
// Add or remove entries freely — the grid adapts.
const POST_URLS = [
  "https://www.instagram.com/p/DZSJbWpA3_5/",
  "https://www.instagram.com/p/DXRyRyHjHHk/",
];

function InstagramSection() {
  const scrollerRef = useRef(null);

  const isSlider = POST_URLS.length > 1;

  const scrollByCard = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // Scroll by one card width (first child) + gap.
    const card = scroller.firstElementChild;
    const amount = card ? card.offsetWidth + 24 : scroller.offsetWidth * 0.8;
    scroller.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  useEffect(() => {
    const SCRIPT_SRC = "https://www.instagram.com/embed.js";

    const process = () => {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
      }
    };

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      // Script already loaded (e.g. on client-side navigation back to the page).
      process();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = process;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="w-full bg-[#F9F9F9] px-4 py-16 sm:px-6 lg:px-8">
      {/* Clip the Instagram embed so only the media (photo/video) is visible —
          the iframe is cross-origin, so its header/footer can only be hidden
          by pulling it up and cropping with the container's overflow. */}
      <style>{`
        .ig-feed-embed .instagram-media {
          margin-top: -54px !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          /* Zoom the embed to "cover" the card so a reel's media fills the
             width and Instagram's baked-in black side bars get cropped off.
             Tune this value (1.3–1.6) if bars still show or it zooms too much. */
          transform: scale(1.45);
          transform-origin: center center;
        }
        .ig-scroller {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ig-scroller::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          {/* <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] shadow-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5.5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.6" cy="6.4" r="1.1" fill="white" stroke="none" />
            </svg>
          </span> */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-4xl"
          >
            Follow Us on Instagram
          </motion.h2>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-[#3d8bff] transition hover:underline"
          >
            @hobit.in
          </a>
        </div>

        {/* Mobile: one post at a time — break out of section px-4 so card fills full width */}
        <div className="relative -mx-4 sm:hidden">
          {isSlider && (
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous posts"
              className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-700 shadow-md transition hover:border-[#3d8bff] hover:text-[#3d8bff]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div
            ref={scrollerRef}
            className="ig-scroller flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 px-4 gap-4"
            style={{ scrollPaddingLeft: "1rem" }}
          >
            {POST_URLS.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative w-[calc(100vw-2rem)] shrink-0 snap-start overflow-hidden rounded-3xl bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100"
              >
                <span className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5]" />
                <div className="ig-feed-embed aspect-4/5 overflow-hidden rounded-[20px] bg-zinc-100">
                  <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={url}
                    data-instgrm-version="14"
                    style={{ margin: 0, minWidth: "auto", width: "100%" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          {isSlider && (
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next posts"
              className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-700 shadow-md transition hover:border-[#3d8bff] hover:text-[#3d8bff]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Desktop: all posts centered in a row, no slider */}
        <div className="hidden sm:flex justify-center gap-6 flex-wrap">
          {POST_URLS.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative w-85 overflow-hidden rounded-3xl bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
            >
              <span className="absolute inset-x-0 top-0 z-10 h-1 bg-linear-to-r from-[#feda75] via-[#d62976] to-[#4f5bd5]" />
              <div className="ig-feed-embed aspect-4/5 overflow-hidden rounded-[20px] bg-zinc-100">
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={url}
                  data-instgrm-version="14"
                  style={{ margin: 0, minWidth: "auto", width: "100%" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d62976] hover:text-[#d62976] hover:shadow-md"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5.5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            View on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

export default InstagramSection;
