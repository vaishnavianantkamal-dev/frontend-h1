import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { cmsService } from "../../api/services/cms";

function ContactSection() {
  const [shortHeading, setShortHeading] = useState("Get in Touch");
  const [heading, setHeading] = useState("We'd love to hear from you");
  const [description, setDescription] = useState(
    "Have questions about our services? Need help with a booking? Our friendly team is here to help you.",
  );
  const [btnLabel, setBtnLabel] = useState("Send Message");
  const [emailTitle, setEmailTitle] = useState("Chat with us");
  const [emailSubtitle, setEmailSubtitle] = useState(
    "Our friendly team is here to help.",
  );
  const [emails, setEmails] = useState([
    "support@hobit.com",
    "hobitkpl@gmail.com",
  ]);
  const [visitTitle, setVisitTitle] = useState("Call us");
  const [visitLocation, setVisitLocation] = useState(
    "Mon-Fri from 8am to 5pm.",
  );
  const [visitAddress, setVisitAddress] = useState(
    "Shop No. 236, Second Floor, Roongta Fururex, Opp. Hotel The One, Near R.D Circle, City Center Mall Road, Govind Nagar, Nashik-422008",
  );
  const [callTitle, setCallTitle] = useState("Call us");
  const [callTiming, setCallTiming] = useState("Mon-Fri from 8am to 5pm.");
  const [phones, setPhones] = useState(["+91 72619 59596"]);
  const [whatsappTitle, setWhatsappTitle] = useState("Whatsapp");
  const [whatsapps, setWhatsapps] = useState(["+91 72619 59596"]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await cmsService.getContactData();
        const data = res?.data || res;
        if (!isMounted || !data) return;

        setShortHeading(data.short_heading || "Get in Touch");
        setHeading(data.heading || "We'd love to hear from you");
        setDescription(
          data.description ||
            "Have questions about our services? Need help with a booking? Our friendly team is here to help you.",
        );
        setBtnLabel(data.btn_name || "Send Message");

        setEmailTitle(data.email_title || "Chat with us");
        setEmailSubtitle(
          data.email_subtitle || "Our friendly team is here to help.",
        );
        if (Array.isArray(data.emails) && data.emails.length > 0) {
          setEmails(data.emails);
        }

        setVisitTitle(data.visit_title || "Call us");
        setVisitLocation(data.visit_location || "Mon-Fri from 8am to 5pm.");
        if (data.visit_address) {
          setVisitAddress(data.visit_address);
        }

        setCallTitle(data.call_title || "Call us");
        setCallTiming(data.call_timing || "Mon-Fri from 8am to 5pm.");
        if (
          Array.isArray(data.phone_numbers) &&
          data.phone_numbers.length > 0
        ) {
          setPhones(data.phone_numbers);
        }

        setWhatsappTitle(data.whatsapp_title || "Whatsapp");
        if (
          Array.isArray(data.whatsapp_numbers) &&
          data.whatsapp_numbers.length > 0
        ) {
          setWhatsapps(data.whatsapp_numbers);
        }
      } catch {
        // keep defaults on error
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="contact" className="relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-[#3d8bff]/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-[#ffe75a]/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2  px-3 py-1 text-base font-medium text-[#3d8bff]">
              <span>{shortHeading}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {heading}
            </h2>
            <p className="max-w-md text-zinc-600">{description}</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3d8bff]/10 text-[#3d8bff]">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{emailTitle}</h3>
                <p className="text-sm text-zinc-600">{emailSubtitle}</p>
                {emails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="mt-1 block text-sm font-medium text-[#3d8bff] hover:underline"
                  >
                    {email}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3d8bff]/10 text-[#3d8bff]">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{callTitle}</h3>
                <p className="text-sm text-zinc-600">{callTiming}</p>
                {phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="mt-1 block text-sm font-medium text-[#3d8bff] hover:underline"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3d8bff]/10 text-[#3d8bff]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  {whatsappTitle}
                </h3>
                {whatsapps.map((wp) => (
                  <a
                    key={wp}
                    href={`tel:${wp.replace(/\s+/g, "")}`}
                    className="mt-1 block text-sm font-medium text-[#3d8bff] hover:underline"
                  >
                    {wp}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/50 sm:p-8"
        >
          <form className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="first-name"
                  className="text-sm font-medium text-slate-900"
                >
                  First name
                </label>
                <input
                  type="text"
                  id="first-name"
                  placeholder="First name"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="last-name"
                  className="text-sm font-medium text-slate-900"
                >
                  Last name
                </label>
                <input
                  type="text"
                  id="last-name"
                  placeholder="Last name"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-900"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@company.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-slate-900"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Tell us what you need help with..."
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3d8bff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3f5ce6] hover:shadow-lg hover:shadow-[#3d8bff]/25"
            >
              <Send className="h-4 w-4" />
              {btnLabel}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default ContactSection;
