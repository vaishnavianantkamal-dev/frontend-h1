import { useState } from "react";
import { MapPin, ShoppingBag, LogOut, X, Pencil } from "lucide-react";
import ProfileModal from "./ProfileModal";

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
        active
          ? "bg-[#3d8bff]/10 text-[#3d8bff]"
          : "text-zinc-500 hover:bg-zinc-50 hover:text-slate-900"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${active ? "text-[#3d8bff]" : "text-zinc-400"}`}
      />
      <span className="text-sm">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3d8bff]" />
      )}
    </button>
  );
}

function SidebarContent({ user, activeTab, setActiveTab, onLogout, onMobileClose, onEditProfile }) {
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    onMobileClose?.();
  };

  return (
    <>
      <div className="p-6 border-b border-zinc-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#3d8bff] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              {user.name?.[0] || "U"}
            </div>
            {user.is_member && (
              <img
                src="/membership.png"
                alt="Member"
                title="Member"
                className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full object-contain bg-white drop-shadow"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 leading-tight truncate">
              {user.name || "Guest User"}
            </h2>
            <p className="text-xs text-zinc-500 font-medium truncate">
              {user.phone || "No phone linked"}
            </p>
          </div>
          <button
            type="button"
            onClick={onEditProfile}
            className="p-2 rounded-lg text-zinc-400 hover:text-[#3d8bff] hover:bg-[#3d8bff]/5 transition shrink-0"
            aria-label="View profile"
            title="Profile"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarItem
          icon={ShoppingBag}
          label="My Services"
          active={activeTab !== "address"}
          onClick={() => handleNavClick("active")}
        />
        <SidebarItem
          icon={MapPin}
          label="Saved Addresses"
          active={activeTab === "address"}
          onClick={() => handleNavClick("address")}
        />

        <div className="pt-4 mt-4 border-t border-zinc-100">
          <button
            onClick={() => {
              onLogout();
              onMobileClose?.();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </nav>
    </>
  );
}

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, mobileOpen, onMobileClose }) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-zinc-200 flex-col sticky top-0 h-[calc(100vh-3rem)]">
        <SidebarContent
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          onEditProfile={() => setProfileOpen(true)}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white border-r border-zinc-200 flex flex-col z-50 lg:hidden transform transition-transform duration-200 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <span className="font-bold text-slate-900">Menu</span>
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>
        <SidebarContent
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          onMobileClose={onMobileClose}
          onEditProfile={() => setProfileOpen(true)}
        />
      </aside>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />
    </>
  );
}
