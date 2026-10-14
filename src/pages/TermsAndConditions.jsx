import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">
        Terms & Conditions
      </h1>
      <p className="mb-8 text-sm text-zinc-500">Effective Date: 15 Feb 2026</p>

      <div className="space-y-8 text-zinc-600">
        <p>
          By accessing or using https://hobit.club/, you agree to the following
          Terms & Conditions.
        </p>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            1. Services
          </h2>
          <p>
            Hobit1 is a technology platform that connects customers with
            independent service professionals. We do not directly provide
            services.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            2. User Responsibilities
          </h2>
          <p className="mb-2">You agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide accurate booking information</li>
            <li>Ensure availability at the service location</li>
            <li>Use the platform for lawful purposes only</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            3. Pricing & Payments
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prices are displayed before booking</li>
            <li>Hobit1 may change prices at its discretion</li>
            <li>
              All payments must be made through authorized payment methods
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            4. Service Professionals
          </h2>
          <p className="mb-2">
            Service professionals are verified, but Hobit1 is not liable for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Acts, omissions, or conduct of service professionals</li>
            <li>Loss or damage arising during service delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            5. Limitation of Liability
          </h2>
          <p className="mb-2">Hobit1 shall not be liable for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Indirect or consequential damages</li>
            <li>Service delays due to factors beyond our control</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            6. Intellectual Property
          </h2>
          <p>
            All content on Hobit1 (logos, text, design) is owned by Hobit1 and may
            not be used without permission.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            7. Account Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            8. Governing Law
          </h2>
          <p>
            These terms shall be governed by the laws of India, and courts of
            Nashik, Maharashtra shall have jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            9. Contact Information
          </h2>
          <p>📧 Email: hobitkpl@gmail.com</p>
          <p>📞 Phone: +91 72619 59596</p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
