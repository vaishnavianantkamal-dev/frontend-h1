import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Phone,
  ArrowLeft,
  CheckCircle2,
  X,
  User,
  Briefcase,
  Loader2,
  MessageCircle,
  MessageSquare,
} from "lucide-react";

import PartnerRegister from "./PartnerRegister";
import { customerService } from "../../api/services/customer";
import { workerService } from "../../api/services/worker";
import toast from "react-hot-toast";

function Login({ isModal = false, onClose }) {
  const [role, setRole] = useState("customer"); // customer, partner
  const [step, setStep] = useState("phone"); // phone, otp, name
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState(""); // "male" | "female" | "other"
  const [referCode, setReferCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showPartnerRegister, setShowPartnerRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingUserMeta, setPendingUserMeta] = useState(null);
  /** Customer OTP delivery: backend `/customer/send-otp` accepts `type` "sms" | "whatsapp" */
  const [customerOtpType, setCustomerOtpType] = useState("sms");
  /** Partner OTP delivery: backend `/worker/login/send-otp` should accept `type` "sms" | "whatsapp" */
  const [partnerOtpType, setPartnerOtpType] = useState("whatsapp");
  const navigate = useNavigate();
  const location = useLocation();

  // Read ?ref=... from URL for customer referral
  useEffect(() => {
    if (role !== "customer") return;
    try {
      const params = new URLSearchParams(location.search || "");
      const ref = params.get("ref");
      if (ref) {
        setReferCode(ref);
      }
    } catch {
      // ignore URL parsing errors
    }
  }, [location.search, role]);

  // Start otp timer when entering otp step
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [step, timer]);

  // Check if user is already logged in and redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user && !isModal) {
      // User is already logged in, redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, isModal]);

  const handlePhoneSubmit = async () => {
    if (phone.length >= 10) {
      setLoading(true);
      try {
        let response;
        if (role === "customer") {
          response = await customerService.sendOTP(phone, customerOtpType);
        } else {
          response = await workerService.sendOTP(phone, partnerOtpType);
        }
        const channel =
          role === "customer" ? customerOtpType : partnerOtpType;
        const fallbackMsg =
          channel === "sms"
            ? "OTP has been sent to your phone via SMS"
            : "OTP has been sent to your WhatsApp number";
        const msg = response?.message || fallbackMsg;
        setSuccessMessage(msg);
        toast.success(msg);
        setStep("otp");
        setTimer(60);
        setCanResend(false);
      } catch (error) {
        console.error("Failed to send OTP:", error);
        toast.error("Failed to send OTP: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      setLoading(true);
      try {
        if (role === "customer") {
          const response = await customerService.verifyOTP(
            phone,
            enteredOtp,
            "",
            customerOtpType,
          );

          if (response.status && response.token) {
            // Always store token so the name update call is authenticated
            localStorage.setItem("token", response.token);

            const needsName =
              response.is_new_user ||
              response.needs_name ||
              !response.user?.name;

            if (needsName) {
              // New user or user without name – ask for name before finishing login
              setPendingUserMeta({
                id: response.user?.id,
                public_id: response.user?.public_id,
                phone,
                is_member: !!response.membership?.is_member,
              });
              setStep("name");
              toast.success(
                response.message || "OTP verified. Please enter your name.",
              );
            } else {
              // Existing user with name – complete login immediately
              const userName = response.user?.name || "User";
              localStorage.setItem(
                "user",
                JSON.stringify({
                  name: userName,
                  phone: phone,
                  id: response.user?.id,
                  public_id: response.user?.public_id,
                  is_member: !!response.membership?.is_member,
                }),
              );
              window.dispatchEvent(new Event("login-success"));
              toast.success(response.message || "Login successful!");
              setPendingUserMeta(null);
              finishLogin();
            }
          } else {
            toast.error("Login failed. Please try again.");
          }
        } else {
          const response = await workerService.verifyOTP(
            phone,
            enteredOtp,
            partnerOtpType,
          );

          if (response.token) {
            localStorage.setItem("token", response.token);
            const workerName = response.user?.name || response.name || "Worker";
            localStorage.setItem(
              "user",
              JSON.stringify({
                name: workerName,
                phone: phone,
                role: "partner",
              }),
            );
            window.dispatchEvent(new Event("login-success"));
            toast.success(response.message || "Login successful!");
            setPendingUserMeta(null);
            finishLogin();
          } else {
            // For partners, if no token, maybe they need to register?
            // The current flow for partners seems to use PartnerRegister component
            setStep("name");
          }
        }
      } catch (error) {
        if (role === "customer") {
          console.log("Customer verification failed:", error);
          toast.error("Verification failed: " + error.message);
        } else {
          console.error("Partner verification failed:", error);
          toast.error("Verification failed: " + error.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNameSubmit = async () => {
    if (name.trim()) {
      if (role === "customer") {
        if (!gender) {
          toast.error("Please select your gender.");
          return;
        }
        setLoading(true);
        try {
          // Call updateName API to set the user's name and gender
          const response = await customerService.updateName(
            name,
            gender,
            referCode || undefined,
          );

          if (response.status) {
            // After setting name on server, treat user as fully logged in
            const baseUser = pendingUserMeta || { phone };
            const finalUser = {
              name: name,
              phone: baseUser.phone || phone,
              id: baseUser.id,
              public_id: baseUser.public_id,
              is_member: !!baseUser.is_member,
            };
            localStorage.setItem("user", JSON.stringify(finalUser));
            window.dispatchEvent(new Event("login-success"));
            toast.success(response.message || "Name updated successfully!");
            setPendingUserMeta(null);
            finishLogin();
          } else {
            toast.error("Failed to update name. Please try again.");
          }
        } catch (error) {
          console.error("Name update failed:", error);
          toast.error("Name update failed: " + error.message);
        } finally {
          setLoading(false);
        }
      } else {
        finishLogin();
      }
    }
  };

  const finishLogin = () => {
    setTimeout(() => {
      if (role === "customer") {
        navigate("/book/service");
      } else {
        navigate("/worker");
      }
      if (onClose) onClose();
    }, 500);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      let response;
      if (role === "customer") {
        response = await customerService.resendOTP(phone, customerOtpType);
      } else {
        response = await workerService.sendOTP(phone, partnerOtpType);
      }
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      toast.success(response?.message || "OTP Resent successfully!");
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Failed to resend OTP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const otpStepChannel =
    role === "customer"
      ? customerOtpType
      : role === "partner"
        ? partnerOtpType
        : null;

  return (
    <div
      className={
        isModal
          ? "w-full"
          : "min-h-screen flex items-center justify-center px-4 py-2 bg-linear-to-br from-[#fef3c7] via-white to-white"
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-300 mx-auto ${showPartnerRegister ? "max-w-6xl h-[85vh]" : "max-w-md"
          }`}
      >
        {showPartnerRegister ? (
          <PartnerRegister
            onBack={() => setShowPartnerRegister(false)}
            onClose={onClose}
          />
        ) : (
          <>
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-zinc-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            <div className="p-8">
              {/* Role Selection - Only show on first step */}
              {step === "phone" && (
                <div className="flex bg-zinc-100 p-1 rounded-xl mb-8">
                  <button
                    onClick={() => setRole("customer")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "customer"
                      ? "bg-white text-[#3d8bff] shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                      }`}
                  >
                    <User className="w-4 h-4" />
                    Customer
                  </button>
                  <button
                    onClick={() => setRole("partner")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "partner"
                      ? "bg-white text-[#3d8bff] shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                      }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Partner
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === "phone" && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {role === "customer"
                        ? "Login"
                        : "Partner Login / Register"}
                    </h2>
                    <p className="text-zinc-600 mb-8">
                      {role === "customer"
                        ? "Enter your mobile number to continue"
                        : "Join our network or login to your account"}
                    </p>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium border-r border-zinc-200 pr-3">
                            +91
                          </span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              if (val.length <= 10) setPhone(val);
                            }}
                            placeholder="98765 43210"
                            className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none transition font-medium text-lg"
                          />
                        </div>
                      </div>

                      {(role === "customer" || role === "partner") && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Get code via
                          </label>
                          <div className="flex bg-zinc-100 p-1 rounded-xl gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                role === "customer"
                                  ? setCustomerOtpType("sms")
                                  : setPartnerOtpType("sms")
                              }
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                (role === "customer"
                                  ? customerOtpType
                                  : partnerOtpType) === "sms"
                                  ? "bg-white text-[#3d8bff] shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-700"
                              }`}
                            >
                              <MessageSquare className="w-4 h-4 shrink-0" />
                              SMS
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                role === "customer"
                                  ? setCustomerOtpType("whatsapp")
                                  : setPartnerOtpType("whatsapp")
                              }
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                (role === "customer"
                                  ? customerOtpType
                                  : partnerOtpType) === "whatsapp"
                                  ? "bg-white text-[#3d8bff] shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-700"
                              }`}
                            >
                              <MessageCircle className="w-4 h-4 shrink-0" />
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handlePhoneSubmit}
                      disabled={phone.length < 10 || loading}
                      className="w-full bg-[#3d8bff] text-white py-3.5 rounded-xl font-semibold hover:bg-[#3f5ce6] transition shadow-lg shadow-[#3d8bff]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          Get OTP <ArrowLeft className="w-4 h-4 rotate-180" />
                        </>
                      )}
                    </button>

                    {role === "partner" && (
                      <div className="mt-6 text-center">
                        <p className="text-sm text-zinc-500">
                          New to Hobit?{" "}
                          <span
                            onClick={() => setShowPartnerRegister(true)}
                            className="text-[#3d8bff] font-medium cursor-pointer hover:underline"
                          >
                            Register as a Partner
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button
                      onClick={() => setStep("phone")}
                      className="mb-6 flex items-center gap-2 text-zinc-600 hover:text-[#3d8bff] transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Edit Number
                    </button>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      Verification Code
                    </h2>
                    {successMessage && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-700 text-center">
                          {successMessage}
                        </p>
                      </div>
                    )}
                    <p className="text-zinc-600 mb-8">
                      {otpStepChannel === "sms" ? (
                        <>
                          We sent a 6-digit code by SMS to{" "}
                          <span className="font-semibold text-slate-900">
                            +91 {phone}
                          </span>
                        </>
                      ) : otpStepChannel === "whatsapp" ? (
                        <>
                          We sent a 6-digit code on WhatsApp to{" "}
                          <span className="font-semibold text-slate-900">
                            +91 {phone}
                          </span>
                        </>
                      ) : (
                        <>
                          We sent a 6-digit code to{" "}
                          <span className="font-semibold text-slate-900">
                            +91 {phone}
                          </span>
                        </>
                      )}
                    </p>

                    <div className="flex gap-2 sm:gap-3 justify-center mb-8">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-zinc-200 rounded-xl focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none transition"
                        />
                      ))}
                    </div>

                    <div className="text-center mb-8">
                      {timer > 0 ? (
                        <p className="text-sm text-zinc-600">
                          Resend code in{" "}
                          <span className="font-semibold text-[#3d8bff]">
                            {timer}s
                          </span>
                        </p>
                      ) : (
                        <button
                          onClick={handleResend}
                          className="text-sm font-semibold text-[#3d8bff] hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={otp.join("").length !== 6}
                      className="w-full bg-[#3d8bff] text-white py-3.5 rounded-xl font-semibold hover:bg-[#3f5ce6] transition shadow-lg shadow-[#3d8bff]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Verify
                    </button>
                  </motion.div>
                )}

                {step === "name" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button
                      onClick={() => setStep("otp")}
                      className="mb-6 flex items-center gap-2 text-zinc-600 hover:text-[#3d8bff] transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {role === "customer"
                        ? "What's your name?"
                        : "Partner Registration"}
                    </h2>
                    <p className="text-zinc-600 mb-8">
                      {role === "customer"
                        ? "Let us know what to call you"
                        : "Enter your full name to create your profile"}
                    </p>

                    <div className="space-y-4 mb-8">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          autoFocus
                          className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none transition text-lg"
                        />
                      </div>
                      {role === "customer" && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Gender
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: "male", label: "Male" },
                              { value: "female", label: "Female" },
                              { value: "other", label: "Other" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setGender(opt.value)}
                                className={`py-3 rounded-xl border text-sm font-medium transition ${
                                  gender === opt.value
                                    ? "border-[#3d8bff] bg-[#3d8bff]/10 text-[#3d8bff]"
                                    : "border-zinc-200 text-slate-700 hover:border-[#3d8bff]/50"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Referral Code{" "}
                          <span className="text-xs text-zinc-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={referCode}
                          onChange={(e) => setReferCode(e.target.value)}
                          placeholder="Enter your referral code"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#3d8bff] focus:ring-2 focus:ring-[#3d8bff]/20 outline-none transition text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleNameSubmit}
                      disabled={
                        !name.trim() ||
                        (role === "customer" && !gender) ||
                        loading
                      }
                      className="w-full bg-[#3d8bff] text-white py-3.5 rounded-xl font-semibold hover:bg-[#3f5ce6] transition shadow-lg shadow-[#3d8bff]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          Continue <ArrowLeft className="w-4 h-4 rotate-180" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default Login;
