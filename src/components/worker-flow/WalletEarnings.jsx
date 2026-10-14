import { IndianRupee, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useState } from "react";

const TABS = ["Today", "Weekly", "Monthly"];

const EARNINGS_DATA = {
  Today: {
    total: 500,
    completed: 1,
    nextPayout: null,
  },
  Weekly: {
    total: 3200,
    completed: 7,
    nextPayout: "March 20, 2024",
  },
  Monthly: {
    total: 12500,
    completed: 28,
    nextPayout: "April 1, 2024",
  },
};

export default function WalletEarnings() {
  const [activeTab, setActiveTab] = useState("Today");
  const data = EARNINGS_DATA[activeTab];
  const profile = JSON.parse(
    localStorage.getItem("worker_profile_data") || "{}",
  );
  const walletBalance = profile.walletBalance || 0;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5">
        <div className="flex gap-1.5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#3d8bff] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Total Earnings Card */}
      <div className="bg-linear-to-br from-[#3d8bff] to-[#4060EE] rounded-lg shadow-sm p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium opacity-90">Total Earnings</h3>
          <TrendingUp className="w-5 h-5 opacity-90" />
        </div>
        <div className="flex items-center gap-1.5">
          <IndianRupee className="w-6 h-6" />
          <span className="text-3xl font-semibold">
            {data.total.toLocaleString()}
          </span>
        </div>
        <p className="text-xs opacity-90 mt-1.5">
          {activeTab === "Today"
            ? "Earned today"
            : activeTab === "Weekly"
              ? "This week"
              : "This month"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completed Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Completed Jobs</p>
              <p className="text-lg font-semibold text-gray-900">
                {data.completed}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {activeTab === "Today"
              ? "Jobs completed today"
              : activeTab === "Weekly"
                ? "Jobs completed this week"
                : "Jobs completed this month"}
          </p>
        </div>

        {/* Next Payout */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 bg-[#FFEA5D] bg-opacity-20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Next Payout</p>
              <p className="text-sm font-semibold text-gray-900">
                {data.nextPayout || "Today"}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {data.nextPayout
              ? "Scheduled payout date"
              : "Earnings will be processed today"}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {[
            {
              id: 1,
              job: "Cleaning - 2 BHK",
              amount: 500,
              date: "Today",
              status: "Completed",
            },
            {
              id: 2,
              job: "Plumbing - 3 BHK",
              amount: 800,
              date: "Yesterday",
              status: "Completed",
            },
            {
              id: 3,
              job: "Cleaning - 1 BHK",
              amount: 350,
              date: "2 days ago",
              status: "Completed",
            },
          ].map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {transaction.job}
                </p>
                <p className="text-xs text-gray-500">{transaction.date}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-base font-semibold text-green-600">
                    {transaction.amount}
                  </span>
                </div>
                <span className="text-xs text-green-600 font-medium">
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="bg-[#FFEA5D] bg-opacity-10 border border-[#FFEA5D] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">
              Current Wallet Balance
            </p>
            <div className="flex items-center gap-1.5">
              <IndianRupee className="w-5 h-5 text-gray-900" />
              <span className="text-xl font-semibold text-gray-900">
                {walletBalance}
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#3d8bff] text-white rounded-md text-sm font-medium hover:bg-[#4060EE] transition-colors">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
