import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  MapPin,
  Wallet,
  HelpCircle,
  LogOut,
  Edit,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    id: "profile",
    label: "Edit Profile",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "bookings",
    label: "My Bookings",
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "addresses",
    label: "Address Book",
    icon: MapPin,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "support",
    label: "Help & Support",
    icon: HelpCircle,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
];

function Profile() {
  const navigate = useNavigate();
  const [user] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 98765 43210",
    avatar: null,
  });

  const handleMenuClick = (itemId) => {
    if (itemId === "bookings") {
      navigate("/dashboard");
    } else if (itemId === "logout") {
      // Handle logout
      navigate("/");
    } else {
      // Handle other menu items
      console.log(`Navigate to ${itemId}`);
    }
  };

  return (
    <div className="min-h-screen pb-12 pt-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-zinc-200 p-8 mb-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#3d8bff] to-[#3f5ce6] flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {user.name}
              </h1>
              <p className="text-zinc-600 mb-1">{user.email}</p>
              <p className="text-sm text-zinc-500">{user.phone}</p>
            </div>
            <button className="p-3 border border-zinc-200 rounded-xl hover:border-[#3d8bff] hover:bg-[#3d8bff]/5 transition">
              <Edit className="w-5 h-5 text-zinc-600" />
            </button>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleMenuClick(item.id)}
                className="w-full bg-white rounded-2xl border border-zinc-200 p-5 flex items-center gap-4 hover:border-[#3d8bff] hover:shadow-lg transition group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-[#3d8bff] transition" />
              </motion.button>
            );
          })}
        </div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => handleMenuClick("logout")}
          className="w-full mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4 hover:bg-red-100 transition group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <LogOut className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-red-600">Logout</p>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400" />
        </motion.button>

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className="text-2xl font-bold text-[#3d8bff] mb-1">12</p>
            <p className="text-xs text-zinc-600">Total Bookings</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600 mb-1">8</p>
            <p className="text-xs text-zinc-600">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className="text-2xl font-bold text-orange-600 mb-1">1</p>
            <p className="text-xs text-zinc-600">Active</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;
