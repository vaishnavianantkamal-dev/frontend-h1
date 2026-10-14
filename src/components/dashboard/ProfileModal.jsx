import { useEffect, useState } from "react";
import {
  X,
  User,
  Phone,
  Loader2,
  AlertCircle,
  Pencil,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { customerService } from "../../api/services/customer";

function ProfileRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
      {icon}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

// Customer profile view. Fetches GET /customer/profile on open. The name is
// editable (saved via POST /customer/profile/update); phone stays read-only.
export default function ProfileModal({ open, onClose, user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Name editing state.
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      setEditingName(false);
      try {
        const res = await customerService.getProfile();
        if (cancelled) return;
        // Tolerate { data: {...} } / { customer: {...} } / bare object shapes.
        setProfile(res?.data ?? res?.customer ?? res ?? null);
      } catch (e) {
        if (cancelled) return;
        console.error("Failed to load profile:", e);
        setError(e?.message || "Couldn't load your profile. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  // Prefer the API values, fall back to the cached user from localStorage.
  const name = profile?.name ?? user?.name ?? "—";
  const phone = profile?.phone ?? profile?.mobile ?? user?.phone ?? "—";

  const startEditName = () => {
    setNameInput(name === "—" ? "" : name);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error("Name can't be empty.");
      return;
    }
    if (trimmed === name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      // POST /customer/profile/update. Only the name changes here; email and
      // gender are re-sent from the loaded profile so they aren't wiped.
      const res = await customerService.updateProfile({
        name: trimmed,
        email: profile?.email ?? "",
        gender: profile?.gender ?? "",
      });
      if (res?.status === false) {
        throw new Error(res?.message || "Failed to update name.");
      }
      // Reflect the new name locally.
      setProfile((prev) => ({ ...(prev || {}), name: trimmed }));
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...stored, name: trimmed }),
        );
        // Let the navbar / dashboard pick up the new name.
        window.dispatchEvent(new Event("login-success"));
      } catch {
        // ignore localStorage/JSON issues – the API save already succeeded
      }
      setEditingName(false);
      toast.success("Name updated.");
    } catch (e) {
      console.error("Failed to update name:", e);
      toast.error(e?.message || "Couldn't update your name. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Profile"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-slate-900">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-zinc-500">
              <Loader2 className="w-6 h-6 text-[#3d8bff] animate-spin" />
              <p className="text-sm">Loading your profile…</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#3d8bff] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                  {name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-lg truncate">
                    {name}
                  </p>
                  <p className="text-sm text-zinc-500 truncate">{phone}</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Editable name row */}
                <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
                  <User className="w-5 h-5 text-zinc-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
                      Name
                    </p>
                    {editingName ? (
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName();
                          if (e.key === "Escape") setEditingName(false);
                        }}
                        autoFocus
                        disabled={savingName}
                        placeholder="Enter your name"
                        className="mt-0.5 w-full bg-transparent text-sm font-medium text-slate-900 outline-none border-b border-[#3d8bff] pb-0.5"
                      />
                    ) : (
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {name}
                      </p>
                    )}
                  </div>
                  {editingName ? (
                    <button
                      onClick={saveName}
                      disabled={savingName}
                      className="p-2 rounded-lg text-[#3d8bff] hover:bg-[#3d8bff]/10 transition disabled:opacity-50"
                      aria-label="Save name"
                    >
                      {savingName ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={startEditName}
                      className="p-2 rounded-lg text-zinc-400 hover:text-[#3d8bff] hover:bg-zinc-100 transition"
                      aria-label="Edit name"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <ProfileRow icon={<Phone className="w-5 h-5 text-zinc-400 shrink-0" />} label="Phone" value={phone} />
              </div>

              <p className="mt-5 text-center text-xs text-zinc-400">
                You can edit your name. Your phone number can't be changed — for
                help, please contact support.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
