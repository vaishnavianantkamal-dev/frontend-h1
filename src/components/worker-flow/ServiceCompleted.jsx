import { CheckCircle, IndianRupee, Star, Gift } from "lucide-react";

export default function ServiceCompleted() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Success Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Service Completed Successfully
        </h2>
        <p className="text-xs text-gray-500">Job ID: #JOB-2024-001</p>
      </div>

      {/* Earnings Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Earnings Summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Service Fee</span>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-gray-600" />
              <span className="text-base font-semibold text-gray-900">450</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#FFEA5D] bg-opacity-10 rounded-lg border border-[#FFEA5D]">
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-gray-700">Customer Tip</span>
            </div>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-yellow-600" />
              <span className="text-base font-semibold text-yellow-800">50</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Total Earnings
              </span>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-5 h-5 text-green-600" />
                <span className="text-xl font-semibold text-green-600">500</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Customer Rating
        </h3>
        <div className="flex items-center gap-1.5 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="w-5 h-5 text-yellow-400 fill-yellow-400"
            />
          ))}
          <span className="ml-1.5 text-sm font-semibold text-gray-900">5.0</span>
        </div>
        <p className="text-sm text-gray-600 italic">
          "Excellent service! Very professional and thorough. Highly recommended!"
        </p>
        <p className="text-xs text-gray-500 mt-1.5">- Rajesh Kumar</p>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-blue-900 mb-1.5">Next Steps</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Earnings will be credited to your wallet within 24 hours</li>
          <li>• View earnings in the Wallet section</li>
          <li>• Look for new job opportunities</li>
        </ul>
      </div>
    </div>
  );
}

