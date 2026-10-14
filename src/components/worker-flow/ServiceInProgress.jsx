import { Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useState } from "react";

const SERVICE_CHECKLIST = [
  { id: 1, task: "Deep Cleaning", completed: true },
  { id: 2, task: "Kitchen Cleaning", completed: true },
  { id: 3, task: "Bathroom Cleaning", completed: false },
  { id: 4, task: "Window Cleaning", completed: false },
];

export default function ServiceInProgress() {
  const [timeElapsed, setTimeElapsed] = useState("01:23:45");
  const [timeRemaining, setTimeRemaining] = useState("01:36:15");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Service In Progress
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Job ID: #JOB-2024-001
            </p>
          </div>
          <div className="px-3 py-1 bg-[#3d8bff] text-white rounded-md text-xs font-medium">
            Active
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#3d8bff] bg-opacity-10 rounded-full mb-3">
            <Clock className="w-6 h-6 text-[#3d8bff]" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Service Timer
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1.5">Time Elapsed</p>
            <p className="text-xl font-semibold text-[#3d8bff]">
              {timeElapsed}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1.5">Time Remaining</p>
            <p className="text-xl font-semibold text-green-600">
              {timeRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Service Checklist */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Service Checklist
        </h3>
        <div className="space-y-2">
          {SERVICE_CHECKLIST.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                item.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              {item.completed ? (
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  item.completed ? "text-green-800" : "text-gray-700"
                }`}
              >
                {item.task}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs font-medium text-gray-700">50%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#3d8bff] h-2 rounded-full transition-all"
              style={{ width: "50%" }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            End Service
          </button>
          <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}
