import { useState, useEffect } from "react";
import {
  Edit2,
  Check,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  ShieldCheck,
  CreditCard,
  Loader2,
  Copy,
  Gift,
} from "lucide-react";
import { workerService } from "../../api/services/worker";
import toast from "react-hot-toast";
import { adminService } from "../../api/services/admin";
import ProfileSkeleton from "./ProfileSkeleton";

const STORAGE_KEY = "worker_profile_data";

export default function ProfileView() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [error, setError] = useState(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState("");
  const [docModalLabel, setDocModalLabel] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editActive, setEditActive] = useState(false);
  const [editCityId, setEditCityId] = useState("");
  const [editZoneId, setEditZoneId] = useState("");
  const [editAreaId, setEditAreaId] = useState("");
  const [editCategoryIds, setEditCategoryIds] = useState([]);
  const [editServiceIds, setEditServiceIds] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [allZones, setAllZones] = useState([]);
  const [allAreas, setAllAreas] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    account_holder_name: "",
    account_no: "",
    bank_name: "",
    ifsc_code: "",
  });
  const [bankEditing, setBankEditing] = useState(false);
  const [editAccountHolder, setEditAccountHolder] = useState("");
  const [editAccountNo, setEditAccountNo] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editIfsc, setEditIfsc] = useState("");
  const [bankFieldErrors, setBankFieldErrors] = useState({});
  const [sectionTab, setSectionTab] = useState("wallet");
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawalExpanded, setWithdrawalExpanded] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [aadhaarNumInput, setAadhaarNumInput] = useState("");
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);
  const [policeNumInput, setPoliceNumInput] = useState("");
  const [policeFrontFile, setPoliceFrontFile] = useState(null);
  const [policeBackFile, setPoliceBackFile] = useState(null);
  const [kycUploading, setKycUploading] = useState(false);
  const [kycError, setKycError] = useState(null);
  const [kycEditing, setKycEditing] = useState(false);
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState(null);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const formatTime12 = (timeStr) => {
    if (!timeStr) return "";
    const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10));
    if (isNaN(hh) || isNaN(mm)) return timeStr;
    const period = hh >= 12 ? "PM" : "AM";
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${hour12}:${mm.toString().padStart(2, "0")} ${period}`;
  };
  const formatRange12 = (range) => {
    if (!range) return "";
    const parts = String(range).split(" - ");
    if (parts.length !== 2) return range;
    return `${formatTime12(parts[0])} - ${formatTime12(parts[1])}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Login required");
        }
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached && !profileData.fullName) {
          setProfileData(JSON.parse(cached));
        }
        const data = await workerService.getProfile();
        const payload = data?.data || data;

        // Map API data to profileData structure
        const rawDocs = Array.isArray(payload?.documents)
          ? payload.documents
          : [];
        const normalizedDocs = rawDocs.map((d) => ({
          type: String(d?.type || "")
            .toLowerCase()
            .trim(),
          front: String(d?.front_url || "").trim(),
          back: String(d?.back_url || "").trim(),
          number: d?.number || "",
        }));
        const mappedData = {
          workerId: payload?.id || payload?.worker_id,
          fullName: payload?.name,
          phoneNumber: payload?.phone,
          email: payload?.email,
          isActive: payload?.is_active === 1,
          profileImage: payload?.profile_image_url,
          address: `${payload?.area?.name ? payload.area.name + ", " : ""}${payload?.zone?.name ? payload.zone.name + ", " : ""}${payload?.city?.name || ""}`,
          cityId: payload?.city?.id || "",
          zoneId: payload?.zone?.id || "",
          areaId: payload?.area?.id || "",
          cityName: payload?.city?.name || "",
          zoneName: payload?.zone?.name || "",
          areaName: payload?.area?.name || "",
          services: payload?.services?.map((s) => s.name) || [],
          serviceIds: payload?.services?.map((s) => s.id) || [],
          categories: payload?.categories?.map((c) => c.name) || [],
          categoryIds: payload?.categories?.map((c) => c.id) || [],
          walletBalance: payload?.wallet_balance,
          kycStatus: payload?.kyc_status,
          aadhaarNumber: normalizedDocs.find(
            (d) => d.type === "aadhar" || d.type === "aadhaar",
          )?.number,
          panNumber: normalizedDocs.find((d) => d.type === "pan")?.number,
          documents: normalizedDocs,
          availability:
            payload?.worker_availablillity?.[0]?.available_dates || [],
          preferredTimeSlots:
            payload?.worker_availablillity?.[0]?.available_times?.map(
              (t) => `${t.start} - ${t.end}`,
            ) || [],
          jobsCompleted: payload?.jobs_completed,
          rating: payload?.average_ratings,
          ratingCount: payload?.rating_count,
        };

        setProfileData(mappedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedData));
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError(error.message || "Failed to load profile");
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          setProfileData(JSON.parse(cached));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cities, zones, areas, categories, services] = await Promise.all([
          adminService.getCities(),
          adminService.getZones(),
          adminService.getAreas(),
          adminService.getServiceCategories(),
          adminService.getServices(),
        ]);
        setAllCities(Array.isArray(cities) ? cities : cities?.data || []);
        setAllZones(Array.isArray(zones) ? zones : zones?.data || []);
        setAllAreas(Array.isArray(areas) ? areas : areas?.data || []);
        setAllCategories(
          Array.isArray(categories) ? categories : categories?.data || [],
        );
        setAllServices(
          Array.isArray(services) ? services : services?.data || [],
        );
      } catch (e) {
        console.error("Failed to load location/service metadata", e);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!profileData.workerId) return;
      try {
        setRatingsError(null);
        setRatingsLoading(true);
        const res = await workerService.getRatings(profileData.workerId);
        const payload = res?.data || res;
        const summary = payload?.summary || null;
        const list = payload?.ratings?.data || payload?.ratings || [];
        setRatingsSummary(summary);
        setRatings(Array.isArray(list) ? list : []);
      } catch (e) {
        setRatingsError(e?.message || "Failed to load ratings");
      } finally {
        setRatingsLoading(false);
      }
    };
    fetchRatings();
  }, [profileData.workerId]);

  useEffect(() => {
    const fetchWithdrawal = async () => {
      if (!profileData.workerId) return;
      try {
        setWithdrawalError(null);
        setWithdrawalLoading(true);
        const res = await workerService.getWithdrawalHistory(
          profileData.workerId,
        );
        const payload = res?.data || res;
        const list = payload?.data || payload || [];
        setWithdrawalHistory(Array.isArray(list) ? list : []);
      } catch (e) {
        setWithdrawalError(e?.message || "Failed to load history");
      } finally {
        setWithdrawalLoading(false);
      }
    };
    if (sectionTab === "wallet") {
      fetchWithdrawal();
    }
  }, [sectionTab, profileData.workerId]);

  const handleOpenWithdraw = () => {
    setWithdrawSuccess(false);
    setWithdrawalError(null);
    setWithdrawAmount("");
    setWithdrawNote("Weekly payout");
    setWithdrawModalOpen(true);
  };
  const handleSubmitWithdraw = async () => {
    try {
      setWithdrawSubmitting(true);
      setWithdrawalError(null);
      const amountNum = Number(withdrawAmount);
      if (!amountNum || amountNum <= 0) {
        throw new Error("Enter a valid amount");
      }
      await workerService.requestWithdrawal({
        amount: amountNum,
        request_note: withdrawNote || "",
      });
      setWithdrawSuccess(true);
      setWithdrawModalOpen(false);
      const res = await workerService.getWithdrawalHistory(
        profileData.workerId,
      );
      const payload = res?.data || res;
      const list = payload?.data || payload || [];
      setWithdrawalHistory(Array.isArray(list) ? list : []);
    } catch (e) {
      setWithdrawalError(e?.message || "Withdrawal request failed");
    } finally {
      setWithdrawSubmitting(false);
    }
  };
  const handleUploadDocs = async () => {
    try {
      setKycError(null);
      setKycUploading(true);
      const entries = [];
      if (aadhaarNumInput && aadhaarFrontFile && aadhaarBackFile) {
        entries.push({
          type: "aadhar",
          number: aadhaarNumInput,
          front: aadhaarFrontFile,
          back: aadhaarBackFile,
        });
      }
      if (policeNumInput && policeFrontFile && policeBackFile) {
        entries.push({
          type: "police_verification",
          number: policeNumInput,
          front: policeFrontFile,
          back: policeBackFile,
        });
      }
      if (entries.length === 0) {
        throw new Error("Add document numbers and files");
      }
      const wid = profileData.workerId || profileData.id;
      await workerService.uploadWorkerDocs(wid, entries);
      const data = await workerService.getProfile();
      const payload = data?.data || data;
      const rawDocs = Array.isArray(payload?.documents)
        ? payload.documents
        : [];
      const normalizedDocs = rawDocs.map((d) => ({
        type: String(d?.type || "")
          .toLowerCase()
          .trim(),
        front: String(d?.front_url || "").trim(),
        back: String(d?.back_url || "").trim(),
        number: d?.number || "",
      }));
      const next = { ...profileData, documents: normalizedDocs };
      setProfileData(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setAadhaarNumInput("");
      setAadhaarFrontFile(null);
      setAadhaarBackFile(null);
      setPoliceNumInput("");
      setPoliceFrontFile(null);
      setPoliceBackFile(null);
    } catch (e) {
      setKycError(e?.message || "Upload failed");
    } finally {
      setKycUploading(false);
    }
  };
  const beginKycEdit = () => {
    setKycError(null);
    const aDoc = profileData.documents?.find(
      (d) => d.type === "aadhar" || d.type === "aadhaar",
    );
    const pDoc = profileData.documents?.find(
      (d) => d.type === "police_verification",
    );
    setAadhaarNumInput(aDoc?.number || "");
    setPoliceNumInput(pDoc?.number || "");
    setAadhaarFrontFile(null);
    setAadhaarBackFile(null);
    setPoliceFrontFile(null);
    setPoliceBackFile(null);
    setKycEditing(true);
  };
  const cancelKycEdit = () => {
    setKycError(null);
    setAadhaarNumInput("");
    setPoliceNumInput("");
    setAadhaarFrontFile(null);
    setAadhaarBackFile(null);
    setPoliceFrontFile(null);
    setPoliceBackFile(null);
    setKycEditing(false);
  };
  useEffect(() => {
    const fetchBank = async () => {
      try {
        setBankError(null);
        setBankLoading(true);
        const res = await workerService.getBankDetails();
        const payload = res?.data || res;
        const bd = payload?.data || payload || {};
        setBankDetails({
          account_holder_name: bd.account_holder_name || "",
          account_no: bd.account_no || "",
          bank_name: bd.bank_name || "",
          ifsc_code: bd.ifsc_code || "",
        });
      } catch (e) {
        setBankError(e?.message || "Failed to load bank details");
      } finally {
        setBankLoading(false);
      }
    };
    fetchBank();
  }, []);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        setReferralLoading(true);
        const res = await workerService.getReferralLink();
        const data = res?.data || res;
        setReferralCode(data?.referral_code || "");
      } catch {
        setReferralCode("");
      } finally {
        setReferralLoading(false);
      }
    };
    fetchReferral();
  }, []);

  const handleCopyReferralCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied!");
    } catch {
      toast.success(`Your referral code: ${referralCode}`);
    }
  };

  const beginEdit = () => {
    setEditName(profileData.fullName || "");
    setEditPhone(profileData.phoneNumber || "");
    setEditEmail(profileData.email || "");
    setEditActive(Boolean(profileData.isActive));
    setEditCityId(profileData.cityId || "");
    setEditZoneId(profileData.zoneId || "");
    setEditAreaId(profileData.areaId || "");
    setEditCategoryIds(profileData.categoryIds || []);
    setEditServiceIds(profileData.serviceIds || []);
    setEditModalOpen(true);
  };
  const cancelEdit = () => {
    setEditModalOpen(false);
  };
  const saveEdit = async () => {
    try {
      const payloadCategories = Array.isArray(editCategoryIds)
        ? editCategoryIds.map(Number)
        : [];
      const payloadServices = Array.isArray(editServiceIds)
        ? editServiceIds.map(Number)
        : [];
      const payload = {
        name: editName,
        phone: editPhone,
        email: editEmail,
        is_active: editActive ? 1 : 0,
        city_id: editCityId ? Number(editCityId) : undefined,
        zone_id: editZoneId ? Number(editZoneId) : undefined,
        area_id: editAreaId ? Number(editAreaId) : undefined,
        category_ids: payloadCategories.length ? payloadCategories : undefined,
        service_ids: payloadServices.length ? payloadServices : undefined,
      };
      const id = profileData.workerId || profileData.id;
      await workerService.updateProfileByAdmin(id, payload);
      const nextCity = allCities.find(
        (c) => String(c.id) === String(editCityId),
      );
      const nextZone = allZones.find(
        (z) => String(z.id) === String(editZoneId),
      );
      const nextArea = allAreas.find(
        (a) => String(a.id) === String(editAreaId),
      );
      const nextCategories = (
        Array.isArray(editCategoryIds) ? editCategoryIds : []
      )
        .map((id) => allCategories.find((c) => String(c.id) === String(id)))
        .filter(Boolean)
        .map((c) => c.name);
      const nextServices = (Array.isArray(editServiceIds) ? editServiceIds : [])
        .map((id) => allServices.find((s) => String(s.id) === String(id)))
        .filter(Boolean)
        .map((s) => s.name);
      const next = {
        ...profileData,
        fullName: editName,
        phoneNumber: editPhone,
        email: editEmail,
        isActive: editActive,
        cityId: editCityId || "",
        zoneId: editZoneId || "",
        areaId: editAreaId || "",
        cityName: nextCity?.name || profileData.cityName || "",
        zoneName: nextZone?.name || profileData.zoneName || "",
        areaName: nextArea?.name || profileData.areaName || "",
        address: `${nextArea?.name ? nextArea.name + ", " : ""}${nextZone?.name ? nextZone.name + ", " : ""}${nextCity?.name || ""}`,
        categories: nextCategories.length
          ? nextCategories
          : profileData.categories,
        categoryIds: Array.isArray(editCategoryIds)
          ? editCategoryIds
          : profileData.categoryIds || [],
        services: nextServices.length ? nextServices : profileData.services,
        serviceIds: Array.isArray(editServiceIds)
          ? editServiceIds
          : profileData.serviceIds || [],
      };
      setProfileData(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setEditModalOpen(false);
    } catch (e) {
      setError(e?.message || "Update failed");
    }
  };
  const handleToggleAvailability = async () => {
    try {
      setAvailabilityError(null);
      setAvailabilityUpdating(true);
      const nextActive = !Boolean(profileData.isActive);
      const id = profileData.workerId || profileData.id;
      const payload = {
        name: profileData.fullName || "",
        phone: profileData.phoneNumber || "",
        email: profileData.email || "",
        is_active: nextActive ? 1 : 0,
      };
      await workerService.updateProfileByAdmin(id, payload);
      const next = { ...profileData, isActive: nextActive };
      setProfileData(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      setAvailabilityError(e?.message || "Failed to update availability");
    } finally {
      setAvailabilityUpdating(false);
    }
  };
  const beginBankEdit = () => {
    setEditAccountHolder(bankDetails.account_holder_name || "");
    setEditAccountNo(bankDetails.account_no || "");
    setEditBankName(bankDetails.bank_name || "");
    setEditIfsc(bankDetails.ifsc_code || "");
    setBankFieldErrors({});
    setBankEditing(true);
  };
  const cancelBankEdit = () => {
    setBankFieldErrors({});
    setBankEditing(false);
  };
  const validateBankFields = () => {
    const errs = {};
    const name = editAccountHolder.trim();
    if (!name) {
      errs.account_holder_name = "Account holder name is required.";
    } else if (!/^[a-zA-Z\s.]+$/.test(name)) {
      errs.account_holder_name = "Only letters, spaces and dots allowed.";
    }

    const accNo = editAccountNo.trim();
    if (!accNo) {
      errs.account_no = "Account number is required.";
    } else if (!/^\d+$/.test(accNo)) {
      errs.account_no = "Account number must contain only digits.";
    } else if (accNo.length < 9 || accNo.length > 18) {
      errs.account_no = "Account number must be 9-18 digits.";
    }

    if (!editBankName.trim()) {
      errs.bank_name = "Bank name is required.";
    }

    const ifsc = editIfsc.trim().toUpperCase();
    if (!ifsc) {
      errs.ifsc_code = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      errs.ifsc_code = "Invalid IFSC format (e.g. SBIN0001234).";
    }

    return errs;
  };
  const saveBankEdit = async () => {
    const errs = validateBankFields();
    setBankFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    try {
      const payload = {
        account_holder_name: editAccountHolder.trim(),
        account_no: editAccountNo.trim(),
        bank_name: editBankName.trim(),
        ifsc_code: editIfsc.trim().toUpperCase(),
      };
      await workerService.updateBankDetails(payload);
      setBankDetails(payload);
      setBankEditing(false);
      setBankFieldErrors({});
    } catch (e) {
      setBankError(e?.message || "Failed to update bank details");
    }
  };
  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error && !profileData.fullName) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Profile</h2>
          <button
            onClick={() => window.dispatchEvent(new Event("login-success"))}
            className="px-3 py-1.5 text-sm bg-[#3d8bff] text-white rounded-md font-medium hover:bg-[#4060EE] transition-colors"
          >
            Retry
          </button>
        </div>
        <p className="text-sm text-red-600 mt-3">{error}</p>
        <p className="text-xs text-gray-500 mt-1">
          Please login as partner and ensure your token is valid.
        </p>
      </div>
    );
  }

  // Reload data from localStorage
  const loadProfileData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setProfileData(saved ? JSON.parse(saved) : {});
  };

  const CalendarView = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    const prevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };
    const nextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
    const availableSet = new Set(profileData.availability || []);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const isToday = (d) =>
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    return (
      <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-3 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevMonth}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-gray-500 hover:text-gray-900 text-xs font-bold transition"
          >
            ‹
          </button>
          <h4 className="text-[11px] font-bold text-gray-800 tracking-wide">
            {monthNames[currentMonth].slice(0, 3)} {currentYear}
          </h4>
          <button
            onClick={nextMonth}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-gray-500 hover:text-gray-900 text-xs font-bold transition"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {dayNames.map((day, i) => (
            <div
              key={i}
              className="text-[9px] font-bold text-gray-400 text-center py-0.5 uppercase"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="w-7 h-7" />;
            }
            const dateStr = date.toISOString().split("T")[0];
            const isAvail = availableSet.has(dateStr);
            const isPast = date < startOfToday;
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`w-7 h-7 text-[10px] font-semibold rounded-lg flex items-center justify-center transition-all ${
                  isTodayDate
                    ? "bg-[#3d8bff] text-white shadow-sm shadow-blue-300/40"
                    : isAvail
                      ? "bg-emerald-100 text-emerald-700"
                      : isPast
                        ? "text-gray-300"
                        : "text-gray-600 hover:bg-white"
                }`}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#3d8bff]" />
            <span className="text-[9px] text-gray-500 font-medium">Today</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-gray-500 font-medium">Available</span>
          </div>
        </div>
      </div>
    );
  };

  // No stepper edit mode; view-only screen

  // View mode - display saved data
  return (
    <div className="space-y-4 pb-8">
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Edit Profile
              </h3>
              <button
                onClick={cancelEdit}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Phone
                  </label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Email
                  </label>
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-6">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditActive((v) => !v)}
                    className={`px-3 py-1 text-xs rounded-md border ${
                      editActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {editActive ? "Yes" : "No"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    City
                  </label>
                  <select
                    value={editCityId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditCityId(value);
                      const relatedZones = allZones.filter(
                        (z) => String(z.city_id) === String(value),
                      );
                      if (
                        !relatedZones.find(
                          (z) => String(z.id) === String(editZoneId),
                        )
                      ) {
                        setEditZoneId("");
                        setEditAreaId("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select City</option>
                    {allCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Zone
                  </label>
                  <select
                    value={editZoneId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditZoneId(value);
                      const relatedAreas = allAreas.filter(
                        (a) => String(a.zone_id) === String(value),
                      );
                      if (
                        !relatedAreas.find(
                          (a) => String(a.id) === String(editAreaId),
                        )
                      ) {
                        setEditAreaId("");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={!editCityId}
                  >
                    <option value="">
                      {!editCityId ? "Select City First" : "Select Zone"}
                    </option>
                    {allZones
                      .filter((z) => String(z.city_id) === String(editCityId))
                      .map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Service Area
                  </label>
                  <select
                    value={editAreaId}
                    onChange={(e) => setEditAreaId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={!editZoneId}
                  >
                    <option value="">
                      {!editZoneId ? "Select Zone First" : "Select Area"}
                    </option>
                    {allAreas
                      .filter((a) => String(a.zone_id) === String(editZoneId))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => {
                      const idStr = String(cat.id);
                      const selected = editCategoryIds
                        .map(String)
                        .includes(idStr);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const current = editCategoryIds.map(String);
                            const next = selected
                              ? current.filter((v) => v !== idStr)
                              : [...current, idStr];
                            setEditCategoryIds(next);
                            const selectedNumeric = next.map(Number);
                            const filtered =
                              selectedNumeric.length === 0
                                ? []
                                : allServices.filter((s) =>
                                    selectedNumeric.includes(s.category_id),
                                  );
                            setEditServiceIds(
                              filtered.map((s) => String(s.id)).filter(Boolean),
                            );
                          }}
                          className={`px-3 py-1 rounded-full border text-[11px] font-medium ${
                            selected
                              ? "bg-[#3d8bff] text-white border-[#3d8bff]"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Services
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allServices
                      .filter((s) =>
                        editCategoryIds.length
                          ? editCategoryIds
                              .map(Number)
                              .includes(Number(s.category_id))
                          : true,
                      )
                      .map((service) => {
                        const idStr = String(service.id);
                        const selected = editServiceIds
                          .map(String)
                          .includes(idStr);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              const current = editServiceIds.map(String);
                              const next = selected
                                ? current.filter((v) => v !== idStr)
                                : [...current, idStr];
                              setEditServiceIds(next);
                            }}
                            className={`px-3 py-1 rounded-full border text-[11px] font-medium ${
                              selected
                                ? "bg-[#3d8bff] text-white border-[#3d8bff]"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {service.name}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="px-3 py-1.5 bg-[#3d8bff] text-white rounded-md text-sm font-medium flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:items-center sm:flex-row">
              <div className="w-16 h-16 bg-blue-50 rounded-full overflow-hidden flex items-center justify-center text-[#3d8bff] text-2xl font-bold border-2 border-white shadow-sm">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt={profileData.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileData.fullName?.[0] || <User />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {profileData.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      profileData.kycStatus === "verified"
                        ? "bg-green-100 text-green-700"
                        : profileData.kycStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    KYC {profileData.kycStatus}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      profileData.isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {profileData.isActive ? "Available" : "Unavailable"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleAvailability}
                      disabled={availabilityUpdating}
                      className={`relative inline-flex h-6 w-11 rounded-full transition ${
                        profileData.isActive ? "bg-green-500" : "bg-gray-300"
                      } ${availabilityUpdating ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
                      aria-label="Toggle Availability"
                    >
                      <span
                        className={`inline-block h-5 w-5 bg-white rounded-full transform transition ${
                          profileData.isActive
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-[11px] font-medium ${
                        profileData.isActive
                          ? "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {availabilityUpdating
                        ? "Updating..."
                        : profileData.isActive
                          ? "Available"
                          : "Unavailable"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1 w-full sm:w-auto">
                    <MapPin className="w-3 h-3" />
                    {profileData.address}
                  </span>
                  {availabilityError && (
                    <span className="text-[10px] text-red-600">
                      {availabilityError}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={beginEdit}
              className="px-4 py-2 text-sm bg-[#3d8bff] text-white rounded-md font-medium hover:bg-[#4060EE] transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionTab("wallet")}
            className={`px-3 py-1.5 text-xs rounded-md border font-medium ${
              sectionTab === "wallet"
                ? "bg-[#3d8bff] text-white border-[#3d8bff]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Wallet
          </button>
          <button
            type="button"
            onClick={() => setSectionTab("kyc")}
            className={`px-3 py-1.5 text-xs rounded-md border font-medium ${
              sectionTab === "kyc"
                ? "bg-[#3d8bff] text-white border-[#3d8bff]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            KYC
          </button>
          <button
            type="button"
            onClick={() => setSectionTab("bank")}
            className={`px-3 py-1.5 text-xs rounded-md border font-medium ${
              sectionTab === "bank"
                ? "bg-[#3d8bff] text-white border-[#3d8bff]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Bank Details
          </button>
        </div>
      </div>

      {sectionTab === "wallet" && (
        <>
          <div className="bg-[#3d8bff] rounded-lg shadow-sm p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium opacity-90">
                Wallet Balance
              </span>
              <CreditCard className="w-5 h-5 opacity-80" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">
                ₹{Number(profileData.walletBalance || 0).toFixed(2)}
              </span>
            </div>
            <div className="mt-2 text-[10px] opacity-80 uppercase tracking-wider">
              Available for withdrawal
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleOpenWithdraw}
                className="px-3 py-1.5 bg-white text-[#3d8bff] rounded-md text-xs font-semibold"
              >
                Request Withdrawal
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Withdrawal History
              </h3>
            </div>
            {withdrawalLoading ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : withdrawalError ? (
              <p className="text-xs text-red-600">{withdrawalError}</p>
            ) : withdrawalHistory.length === 0 ? (
              <p className="text-xs text-gray-500">No withdrawals yet</p>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {(withdrawalExpanded
                    ? withdrawalHistory
                    : withdrawalHistory.slice(0, 3)
                  ).map((w) => {
                    const status = String(w.status || "")
                      .toLowerCase()
                      .trim();
                    const statusClass =
                      status === "approved"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200";
                    return (
                      <div
                        key={w.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{Number(w.amount || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Requested {new Date(w.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${statusClass}`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-600">
                            Approved:{" "}
                            {w.approved_amount
                              ? `₹${Number(w.approved_amount).toFixed(2)}`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {withdrawalHistory.length > 3 && (
                  <button
                    onClick={() => setWithdrawalExpanded((p) => !p)}
                    className="mt-2 text-xs font-semibold text-[#3d8bff] hover:underline"
                  >
                    {withdrawalExpanded
                      ? "Show less"
                      : `+${withdrawalHistory.length - 3} more`}
                  </button>
                )}
              </>
            )}
          </div>
          {withdrawModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-4 max-w-sm w-full relative">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Request Withdrawal
                  </h4>
                  <button
                    onClick={() => setWithdrawModalOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Request Note
                    </label>
                    <input
                      type="text"
                      value={withdrawNote}
                      onChange={(e) => setWithdrawNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  {withdrawalError && (
                    <p className="text-xs text-red-600">{withdrawalError}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleSubmitWithdraw}
                      disabled={withdrawSubmitting}
                      className="px-3 py-1.5 bg-[#3d8bff] text-white rounded-md text-sm font-medium flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {withdrawSubmitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Submit
                    </button>
                    <button
                      onClick={() => setWithdrawModalOpen(false)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <User className="w-4 h-4 text-[#3d8bff]" />
            <h3 className="text-sm font-semibold text-gray-900">
              Personal Details
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                Full Name
              </label>
              {isEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">
                  {profileData.fullName || "Not provided"}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">
                    {profileData.phoneNumber || "Not provided"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                  Email
                </label>
                {isEditing ? (
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profileData.email || "Not provided"}
                  </p>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-2 flex items-center gap-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => setEditActive((v) => !v)}
                  className={`px-3 py-1 text-xs rounded-md border ${
                    editActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {editActive ? "Yes" : "No"}
                </button>
              </div>
            )}
            {isEditing && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveEdit}
                  className="px-3 py-1.5 bg-[#3d8bff] text-white rounded-md text-sm font-medium flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <Briefcase className="w-4 h-4 text-[#3d8bff]" />
            <h3 className="text-sm font-semibold text-gray-900">
              Professional Stats
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Jobs Done
              </label>
              <p className="text-xl font-bold text-gray-900">
                {profileData.jobsCompleted || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Avg Rating
              </label>
              <div className="flex flex-col">
                <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  {ratingsSummary?.average_rating ?? profileData.rating ?? 0}
                  <span className="text-yellow-400 text-sm">★</span>
                </p>
                <span className="text-[10px] text-gray-500 font-medium">
                  from{" "}
                  {ratingsSummary?.total_ratings ??
                    profileData.ratingCount ??
                    0}{" "}
                  reviews
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">
              Recent Reviews
            </h4>
            {ratingsLoading ? (
              <p className="text-xs text-gray-500">Loading ratings...</p>
            ) : ratingsError ? (
              <p className="text-xs text-red-600">{ratingsError}</p>
            ) : ratings.length === 0 ? (
              <p className="text-xs text-gray-500">No reviews received yet.</p>
            ) : (
              <>
                <div className="space-y-2 pr-1">
                  {(reviewsExpanded ? ratings : ratings.slice(0, 1)).map((r) => (
                    <div
                      key={r.id}
                      className="border border-gray-100 rounded-lg p-2 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          {r.customer?.name || "Customer"}
                        </span>
                        <span className="flex items-center gap-0.5 text-yellow-400 font-semibold">
                          {r.rating}
                          <span>★</span>
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-gray-600 line-clamp-2">
                          {r.description}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        Booking #{r.booking_id}
                      </p>
                    </div>
                  ))}
                </div>
                {ratings.length > 1 && (
                  <button
                    onClick={() => setReviewsExpanded((p) => !p)}
                    className="mt-2 text-xs font-semibold text-[#3d8bff] hover:underline"
                  >
                    {reviewsExpanded
                      ? "Show less"
                      : `+${ratings.length - 1} more review${ratings.length - 1 > 1 ? "s" : ""}`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {sectionTab === "bank" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <CreditCard className="w-4 h-4 text-[#3d8bff]" />
            <h3 className="text-sm font-semibold text-gray-900">
              Bank Details
            </h3>
          </div>
          <div className="space-y-4">
            {bankLoading ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : bankError ? (
              <p className="text-xs text-red-600">{bankError}</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Account Holder Name
                    </label>
                    {bankEditing ? (
                      <>
                        <input
                          value={editAccountHolder}
                          onChange={(e) => {
                            setEditAccountHolder(e.target.value);
                            setBankFieldErrors((p) => ({ ...p, account_holder_name: undefined }));
                          }}
                          placeholder="e.g. John Doe"
                          className={`w-full px-3 py-2 border rounded-md text-sm ${bankFieldErrors.account_holder_name ? "border-red-400" : "border-gray-300"}`}
                        />
                        {bankFieldErrors.account_holder_name && (
                          <p className="text-[11px] text-red-500 mt-0.5">{bankFieldErrors.account_holder_name}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {bankDetails.account_holder_name || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Account Number
                    </label>
                    {bankEditing ? (
                      <>
                        <input
                          value={editAccountNo}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setEditAccountNo(val);
                            setBankFieldErrors((p) => ({ ...p, account_no: undefined }));
                          }}
                          placeholder="e.g. 123456789012"
                          maxLength={18}
                          inputMode="numeric"
                          className={`w-full px-3 py-2 border rounded-md text-sm ${bankFieldErrors.account_no ? "border-red-400" : "border-gray-300"}`}
                        />
                        {bankFieldErrors.account_no && (
                          <p className="text-[11px] text-red-500 mt-0.5">{bankFieldErrors.account_no}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {bankDetails.account_no || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      Bank Name
                    </label>
                    {bankEditing ? (
                      <>
                        <input
                          value={editBankName}
                          onChange={(e) => {
                            setEditBankName(e.target.value);
                            setBankFieldErrors((p) => ({ ...p, bank_name: undefined }));
                          }}
                          placeholder="e.g. State Bank of India"
                          className={`w-full px-3 py-2 border rounded-md text-sm ${bankFieldErrors.bank_name ? "border-red-400" : "border-gray-300"}`}
                        />
                        {bankFieldErrors.bank_name && (
                          <p className="text-[11px] text-red-500 mt-0.5">{bankFieldErrors.bank_name}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {bankDetails.bank_name || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                      IFSC Code
                    </label>
                    {bankEditing ? (
                      <>
                        <input
                          value={editIfsc}
                          onChange={(e) => {
                            setEditIfsc(e.target.value.toUpperCase());
                            setBankFieldErrors((p) => ({ ...p, ifsc_code: undefined }));
                          }}
                          placeholder="e.g. SBIN0001234"
                          maxLength={11}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${bankFieldErrors.ifsc_code ? "border-red-400" : "border-gray-300"}`}
                        />
                        {bankFieldErrors.ifsc_code && (
                          <p className="text-[11px] text-red-500 mt-0.5">{bankFieldErrors.ifsc_code}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {bankDetails.ifsc_code || "Not provided"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  {bankEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={saveBankEdit}
                        className="px-3 py-1.5 bg-[#3d8bff] text-white rounded-md text-sm font-medium flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelBankEdit}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={beginBankEdit}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium flex items-center gap-1.5"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Referral Code */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
          <Gift className="w-4 h-4 text-[#3d8bff]" />
          <h3 className="text-sm font-semibold text-gray-900">Referral Code</h3>
        </div>
        {referralLoading ? (
          <p className="text-xs text-gray-500">Loading...</p>
        ) : referralCode ? (
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 tracking-wide">
              {referralCode}
            </span>
            <button
              type="button"
              onClick={handleCopyReferralCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3d8bff] text-white text-xs font-semibold hover:bg-[#3570d4] transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">No referral code available.</p>
        )}
      </div>

      {/* Services & Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
          <Briefcase className="w-4 h-4 text-[#3d8bff]" />
          <h3 className="text-sm font-semibold text-gray-900">
            Services & Categories
          </h3>
        </div>
        {(() => {
          const cats = profileData.categories || [];
          const svcs = profileData.services || [];
          const allItems = [
            ...cats.map((c) => ({ type: "cat", label: c })),
            ...svcs.map((s) => ({ type: "srv", label: s })),
          ];
          const LIMIT = 4;
          const visible = servicesExpanded ? allItems : allItems.slice(0, LIMIT);
          const hasMore = allItems.length > LIMIT;

          return (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {visible.map((item, index) => (
                  <span
                    key={`${item.type}-${index}`}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                      item.type === "cat"
                        ? "bg-blue-50 text-[#3d8bff] border-blue-100"
                        : "bg-gray-50 text-gray-600 border-gray-200 font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              {hasMore && (
                <button
                  onClick={() => setServicesExpanded((p) => !p)}
                  className="text-xs font-semibold text-[#3d8bff] hover:underline"
                >
                  {servicesExpanded
                    ? "Show less"
                    : `+${allItems.length - LIMIT} more`}
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Availability */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
          <Clock className="w-4 h-4 text-[#3d8bff]" />
          <h3 className="text-sm font-semibold text-gray-900">Availability</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Working Hours
            </label>
            <div className="flex flex-wrap gap-2">
              {profileData.preferredTimeSlots?.map((slot, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Clock className="w-3 h-3" />
                  {formatRange12(slot)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Availability Calendar
            </label>
            <CalendarView />
          </div>
        </div>
      </div>

      {/* KYC & Documents */}
      {sectionTab === "kyc" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-[#3d8bff]" />
            <h3 className="text-sm font-semibold text-gray-900">
              KYC & Documents
            </h3>
            <div className="ml-auto">
              {kycEditing ? (
                <button
                  type="button"
                  onClick={cancelKycEdit}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={beginKycEdit}
                  className="px-3 py-1.5 bg-[#3d8bff] text-white rounded-md text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Aadhaar Card
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {profileData.aadhaarNumber
                    ? profileData.aadhaarNumber.replace(
                        /(\d{4})(\d{4})(\d{4})/,
                        "$1 $2 $3",
                      )
                    : profileData.kycStatus === "verified"
                      ? "Verified"
                      : "Not Uploaded"}
                </p>
              </div>
              <div className="flex gap-2">
                {profileData.documents
                  ?.filter((d) => d.type === "aadhar")
                  .map((doc, idx) => (
                    <div key={idx} className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDocModalLabel("Aadhaar Front View");
                          setDocModalUrl(doc.front);
                          setDocModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-[#3d8bff] hover:underline"
                      >
                        Front View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDocModalLabel("Aadhaar Back View");
                          setDocModalUrl(doc.back);
                          setDocModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-[#3d8bff] hover:underline"
                      >
                        Back View
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Police Verification
                </label>

                {profileData.documents?.find(
                  (d) => d.type === "police_verification" && d.number,
                ) && (
                  <p className="text-sm font-bold text-gray-900">
                    {
                      profileData.documents.find(
                        (d) => d.type === "police_verification" && d.number,
                      )?.number
                    }
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {profileData.documents
                  ?.filter((d) => d.type === "police_verification")
                  .map((doc, idx) => (
                    <div key={idx} className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDocModalLabel("Police Verification Front View");
                          setDocModalUrl(doc.front);
                          setDocModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-[#3d8bff] hover:underline"
                      >
                        Front View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDocModalLabel("Police Verification Back View");
                          setDocModalUrl(doc.back);
                          setDocModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-[#3d8bff] hover:underline"
                      >
                        Back View
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {kycEditing && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Upload/Update Documents
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Aadhaar
                  </label>
                  <input
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarNumInput}
                    onChange={(e) => setAadhaarNumInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      setAadhaarFrontFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      setAadhaarBackFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Police Verification
                  </label>
                  <input
                    type="text"
                    placeholder="Document Number"
                    value={policeNumInput}
                    onChange={(e) => setPoliceNumInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      setPoliceFrontFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="file"
                    onChange={(e) =>
                      setPoliceBackFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              {kycError && (
                <p className="text-xs text-red-600 mt-2">{kycError}</p>
              )}
              <div className="mt-3">
                <button
                  onClick={handleUploadDocs}
                  disabled={kycUploading}
                  className="px-3 py-1.5 bg-[#3d8bff] text-white rounded-md text-sm font-medium disabled:opacity-60 flex items-center gap-1.5"
                >
                  {kycUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Documents
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {docModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-3 sm:p-4 max-w-lg w-full relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                {docModalLabel}
              </h4>
              <button
                onClick={() => setDocModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-auto flex-1 min-h-0">
              <img
                src={docModalUrl}
                alt={docModalLabel}
                className="w-full h-auto object-contain max-h-[75vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
