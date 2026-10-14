import {
  MapPin,
  Clock,
  IndianRupee,
  User,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function JobDetailsView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Section - Job Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Job Details
            </h2>
            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium flex items-center gap-1 border border-green-200">
              <CheckCircle className="w-3 h-3" />
              Approved
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Customer Info */}
          <div>
            <div className="flex items-center gap-1.5 text-gray-600 mb-1.5">
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">Customer</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">Rajesh Kumar</p>
            <p className="text-xs text-gray-500">+91 9876543210</p>
          </div>

          {/* Service Details */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 mb-2">
              Services Included
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-gray-700">Deep Cleaning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-gray-700">Kitchen Cleaning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-gray-700">Bathroom Cleaning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs text-gray-700">Window Cleaning</span>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="border-t border-gray-100 pt-3">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    March 15, 2024
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Time Slot</p>
                  <p className="text-sm font-medium text-gray-900">
                    Morning (9:00 AM - 12:00 PM)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-600">Estimated Duration</p>
                  <p className="text-sm font-medium text-gray-900">3 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Earnings</span>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-xl font-semibold text-gray-900">450</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full px-4 py-2 bg-[#3d8bff] text-white rounded-md text-sm font-medium hover:bg-[#4060EE] transition-colors">
            Accept Job
          </button>
        </div>
      </div>

      {/* Right Section - Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>

        {/* Map Placeholder */}
        <div className="bg-gray-50 rounded-lg h-80 flex items-center justify-center mb-3 border border-gray-200">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-1.5" />
            <p className="text-sm text-gray-600 font-medium">Map View</p>
            <p className="text-xs text-gray-500 mt-0.5">2.3 km away</p>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-800 font-medium mb-0.5">
            Full address visible after accepting job
          </p>
          <p className="text-xs text-blue-700">
            Complete address details will be shared once you accept the job
            request.
          </p>
        </div>
      </div>
    </div>
  );
}
