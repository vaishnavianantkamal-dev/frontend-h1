import { useRef } from "react";
import { motion } from "framer-motion";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Hobit_club";

const SHORTS = [
  { id: "9QvyWr8PR-k", title: "Hobit1 in Action" },
  { id: "uh9q5j2g-OE", title: "Real Results" },
];

function YouTubeSection() {
  const scrollerRef = useRef(null);

  const scrollByCard = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.firstElementChild;
    const amount = card ? card.offsetWidth + 16 : scroller.offsetWidth;
    scroller.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 lg:px-8">
      <style>{`
        .yt-scroller {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .yt-scroller::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center mb-12 space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-4xl"
          >
            Watch How Hobit1 Works
          </motion.h2>
          <p className="text-lg text-zinc-500">Real homes. Real results.</p>
        </div>

        {/* Mobile: one video at a time, break out of section px-4 */}
        <div className="relative -mx-4 sm:hidden">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            aria-label="Previous video"
            className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-700 shadow-md transition hover:border-[#FF0000] hover:text-[#FF0000]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            ref={scrollerRef}
            className="yt-scroller flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 px-4 gap-4"
            style={{ scrollPaddingLeft: "1rem" }}
          >
            {SHORTS.map((short, i) => (
              <motion.div
                key={short.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="w-[calc(100vw-2rem)] shrink-0 snap-start overflow-hidden rounded-2xl shadow-lg border border-zinc-100"
              >
                <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${short.id}?rel=0&modestbranding=1`}
                    title={short.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            aria-label="Next video"
            className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-700 shadow-md transition hover:border-[#FF0000] hover:text-[#FF0000]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Desktop: all videos centered side by side */}
        <div className="hidden sm:flex justify-center gap-6">
          {SHORTS.map((short, i) => (
            <motion.div
              key={short.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="w-70 overflow-hidden rounded-2xl shadow-lg border border-zinc-100"
            >
              <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${short.id}?rel=0&modestbranding=1`}
                  title={short.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FF0000] hover:text-[#FF0000] hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
            </svg>
            Visit Our YouTube Channel
          </a>
        </div>
      </div>
    </section>
  );
}

export default YouTubeSection;
