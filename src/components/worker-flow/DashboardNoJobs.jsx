import { Wifi, WifiOff, Clock, AlertCircle, IndianRupee } from "lucide-react";
import { useState } from "react";

export default function DashboardNoJobs() {
  const [isOnline, setIsOnline] = useState(true);
  const profile = JSON.parse(
    localStorage.getItem("worker_profile_data") || "{}",
  );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Dashboard</h2>
            <p className="text-xs text-gray-500 mt-0.5">No jobs available</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${isOnline
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline
                </>
              )}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-semibold bg-[#3d8bff] text-white">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>₹{profile.walletBalance || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mb-3">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1.5">
            No Jobs Available
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Your KYC verification is pending. Once approved, you'll start
            receiving job requests.
          </p>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 max-w-sm mx-auto">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-medium text-blue-900 mb-1.5">
                  Next Steps
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Complete your profile setup</li>
                  <li>• Wait for KYC verification</li>
                  <li>• Receive job notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
          <h3 className="text-sm font-semibold text-gray-900">Your Services</h3>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap gap-2">
              {(profile.categories || []).map((cat, index) => (
                <span
                  key={`cat-${index}`}
                  className="px-3 py-1 bg-blue-50 text-[#3d8bff] rounded-full text-[11px] font-bold border border-blue-100"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              {(profile.services || []).map((service, index) => (
                <span
                  key={`srv-${index}`}
                  className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[11px] font-medium border border-gray-200"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
