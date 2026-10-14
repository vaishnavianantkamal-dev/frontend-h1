import { Clock, FileText, CheckCircle } from "lucide-react";

export default function KYCStatusScreen() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            KYC Verification Status
          </h2>
          <p className="text-sm text-gray-600">
            Your verification documents are being reviewed
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-[#FFEA5D] bg-opacity-10 border border-[#FFEA5D] rounded-lg p-4 mb-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">
              Pending Review
            </span>
          </div>
          <p className="text-center text-sm text-gray-700">
            Your documents are under verification. Jobs will be available after admin approval.
          </p>
        </div>

        {/* Document Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Document Status
          </h3>

          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Aadhaar Card</span>
              </div>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                Under Review
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">PAN Card</span>
              </div>
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                Under Review
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Bank Account Details</span>
              </div>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Verification typically takes 24-48 hours. You will receive a notification once your KYC is approved.
          </p>
        </div>
      </div>
    </div>
  );
}

