export default function DashboardTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-white text-[#3d8bff] shadow-md border-transparent"
              : "text-zinc-500 hover:text-slate-900 border border-zinc-200 bg-white/50"
          }`}
        >
          <tab.icon
            className={`w-4 h-4 ${activeTab === tab.id ? "text-[#3d8bff]" : "text-zinc-400"}`}
          />
          {tab.label}
          {tab.count > 0 && (
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? "bg-[#3d8bff]/10 text-[#3d8bff]"
                  : "bg-zinc-200 text-zinc-600"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
