import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 ">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mb-8 text-sm text-zinc-500">Effective Date: 15 Feb 2026</p>

      <div className="space-y-8 text-zinc-600">
        <p>
          Welcome to Hobit1 (“we”, “our”, “us”). Your privacy is important to us,
          and this Privacy Policy explains how we collect, use, and protect your
          information when you visit https://hobit.club/ or use our services.
        </p>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            1. Information We Collect
          </h2>
          <p className="mb-2">We may collect the following information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Personal Information: Name, phone number, email address, address
            </li>
            <li>Service Details: Booking details, service preferences</li>
            <li>
              Payment Information: Payment status and transaction IDs (we do not
              store card or UPI details)
            </li>
            <li>Technical Data: IP address, device type, browser, cookies</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            2. How We Use Your Information
          </h2>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and manage services</li>
            <li>Process bookings and payments</li>
            <li>Communicate service updates and offers</li>
            <li>Improve website performance and customer experience</li>
            <li>Prevent fraud and misuse</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            3. Sharing of Information
          </h2>
          <p className="mb-2">
            We do not sell your personal data. Information may be shared only
            with:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verified service partners for service fulfillment</li>
            <li>Payment gateway providers</li>
            <li>Legal or regulatory authorities when required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            4. Data Security
          </h2>
          <p>
            We use reasonable technical and organizational measures to protect
            your data. However, no system is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            5. Cookies
          </h2>
          <p>
            Hobit1 uses cookies to improve website functionality and user
            experience. You can disable cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            6. Your Rights
          </h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access or update your personal information</li>
            <li>
              Request deletion of your data (subject to legal requirements)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            7. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            8. Contact Us
          </h2>
          <p>📧 Email: hobitkpl@gmail.com</p>
          <p>📞 Phone: +91 72619 59596</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
