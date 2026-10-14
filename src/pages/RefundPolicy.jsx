import React from "react";

const RefundPolicy = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">
        Refund & Cancellation Policy
      </h1>

      <div className="space-y-8 text-zinc-600">
        <p>
          At Hobit1, we aim to provide high-quality services. Our refund and
          cancellation policy is outlined below.
        </p>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            1. Cancellations
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Customers can cancel a booking before the service starts via the
              Hobit1 platform or customer support.
            </li>
            <li>Late cancellations may be subject to a cancellation fee.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            2. Refund Eligibility
          </h2>
          <p className="mb-2">Refunds may be issued if:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Service was not delivered</li>
            <li>Service professional did not arrive</li>
            <li>There was a genuine service quality issue</li>
          </ul>
          <p className="mt-4 mb-2">Refunds are not applicable if:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Customer is unavailable at service time</li>
            <li>Service is partially or fully completed</li>
            <li>Issue is reported after a reasonable time</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            3. Refund Process
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Approved refunds will be processed to the original payment method
            </li>
            <li>
              Refunds may take 5–7 working days depending on the bank/payment
              gateway
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            4. Subscription Services (If Applicable)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Subscription fees are non-refundable once the service period
              begins
            </li>
            <li>Unused services may not be carried forward unless specified</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            5. Final Decision
          </h2>
          <p>
            Hobit1 reserves the right to make the final decision on all refund
            requests.
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
