import React, { useState } from "react";
import { motion } from "framer-motion";
import AppStoreLogo from "../../assets/appstore.png";
import PlayStoreLogo from "../../assets/playstore.png";
// import { cmsService } from "../../api/services/cms"; // Hobit1: old cleaning CMS FAQs not used

// OLD cleaning-only FAQs (pre-Hobit1) — not used.
/*
const defaultFaqs = [
  {
    question: "What is Hobit?",
    answer:
      "Hobit is your on-demand home management partner. We connect you with verified professionals for cleaning and upkeep, so you can stop chasing maids and start enjoying your free time.",
  },
  {
    question: "What if the professional doesn’t show up?",
    answer:
      "We've got you covered. In the rare event of a no-show, we instantly arrange a replacement or provide a full refund plus a discount on your next service. Your schedule is our priority.",
  },
  {
    question: "Are professionals verified?",
    answer:
      "Absolutely. Every Hobit professional goes through a strict background check and skill assessment. We only onboard people we'd trust in our own homes.",
  },
  {
    question: "Is pricing fixed?",
    answer:
      "Yes, 100%. The price you see on the app is the price you pay. No hidden charges, no last-minute bargaining, and no surprises.",
  },
  {
    question: "Can I book recurring services?",
    answer:
      "Definitely! You can set up a 'set it and forget it' schedule—whether it's daily cleaning or weekly deep cleans—so your home runs on autopilot.",
  },
  {
    question: "Which areas are currently live?",
    answer:
      "We are currently serving major neighborhoods in Nashik, including College Road, Gangapur Road, and Indiranagar. We're expanding fast, so check the app for the latest updates!",
  },
];
*/

// Hobit1 FAQs
const defaultFaqs = [
  {
    question: "What is Hobit1?",
    answer:
      "Hobit1 is your home services partner in Nashik. Book verified professionals for deep cleaning, pest control, painting, electrical, plumbing and carpentry work from one app.",
  },
  {
    question: "Are professionals verified?",
    answer:
      "Yes. Every Hobit1 professional is background-checked and skill-tested. The job starts only after you share the OTP, so you always know who is working in your home.",
  },
  {
    question: "Is pricing fixed?",
    answer:
      "Yes. Most services have a fixed or per-unit price shown before you book. For bigger jobs like full home painting, waterproofing or wiring, an expert inspects first and gives a clear quote.",
  },
  {
    question: "What if I'm not happy with the work?",
    answer:
      "Every service comes with a service warranty. If something is not right, tell us through the app and we will arrange a free rework.",
  },
  {
    question: "How can I pay?",
    answer:
      "Pay online in the app, or pay after the service is done. No hidden charges, no last-minute bargaining.",
  },
  {
    question: "Which areas are currently live?",
    answer:
      "We currently serve Nashik, Maharashtra, including College Road, Gangapur Road and Indiranagar. We're expanding fast, so check the app for the latest updates!",
  },
];

function FaqSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [shortHeading] = useState("Common Questions");
  const [heading] = useState("Frequently Asked Questions");
  const [description] = useState(
    "Everything you need to know about booking Hobit1. Can't find your answer? Reach out through the app.",
  );
  const [faqs] = useState(defaultFaqs);

  // Hobit1: old cleaning-only CMS FAQs not used.
  // useEffect(() => {
  //   let isMounted = true;

  //   const load = async () => {
  //     try {
  //       const res = await cmsService.getFaqsData();
  //       const list = Array.isArray(res?.data)
  //         ? res.data
  //         : Array.isArray(res)
  //           ? res
  //           : [];

  //       if (!isMounted || list.length === 0) return;

  //       const first = list[0];

  //       setShortHeading(first?.short_heading || "Common Questions");
  //       setHeading(first?.heading || "Frequently Asked Questions");
  //       setDescription(
  //         first?.description ||
  //           "Everything you need to know about booking hobit. Can't find your answer? Reach out through the app.",
  //       );

  //       const cards = Array.isArray(first.cards)
  //         ? first.cards.map((card) => ({
  //             question: card.question,
  //             answer: card.answer,
  //           }))
  //         : [];

  //       if (cards.length > 0) {
  //         setFaqs(cards);
  //       }
  //     } catch {
  //       // keep defaults on error
  //     }
  //   };

  //   load();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  return (
    <section
      id="faqs"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2  px-3 py-1 text-base font-medium text-[#3d8bff] mb-6">
            <span>{shortHeading}</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-2 max-w-xl text-lg text-zinc-600">{description}</p>
        </motion.div>
      </div>
      <div className="flex flex-col gap-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <motion.button
                key={item.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                type="button"
                onClick={() =>
                  setOpenFaqIndex((current) => (current === index ? -1 : index))
                }
                className="flex h-fit flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-left text-sm transition hover:-translate-y-0.5 hover:border-[#3d8bff] hover:shadow-sm"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <p className="font-medium text-lg text-slate-900">
                    {item.question}
                  </p>
                  <span className="text-lg text-zinc-500">
                    {isOpen ? "−" : "+"}
                  </span>
                </div>
                {isOpen && (
                  <p className="mt-3 text-base leading-relaxed text-zinc-600">
                    {item.answer}
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#3d8bff] bg-linear-to-br from-[#3d8bff]/10 via-[#ffe75a]/20 to-white p-8 shadow-sm"
        >
          <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3d8bff]">
                Get the app
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Get trusted home services in minutes.
              </h3>
              <p className="max-w-xl text-sm text-zinc-700">
                Nashik homes trust Hobit1 for cleaning, repairs and upkeep. Join
                them and get every home job done without follow-ups. No spam.
                No random calls.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-5">
              <div className="relative">
                <a
                  href="https://play.google.com/store/apps/details?id=com.hobit.hobitt&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="overflow-hidden rounded-xl transition hover:scale-105 active:scale-95"
                >
                  <img
                    src={PlayStoreLogo}
                    alt="Get it on Google Play"
                    className="h-10 w-auto"
                  />
                </a>
              </div>
              <div className="relative">
                <a
                  href="https://apps.apple.com/in/app/hobit/id6761460845"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="overflow-hidden rounded-xl transition hover:scale-105 active:scale-95"
                >
                  <img
                    src={AppStoreLogo}
                    alt="Download on the App Store"
                    className="h-10 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FaqSection;
