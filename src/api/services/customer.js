import { apiClient } from "../client";

export const customerService = {
  sendOTP: async (phone, type = "whatsapp") => {
    return await apiClient("/customer/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, type }),
    });
  },
  resendOTP: async (phone, type = "whatsapp") => {
    return await apiClient("/customer/resend-otp", {
      method: "POST",
      body: JSON.stringify({ phone, type }),
    });
  },
  verifyOTP: async (phone, otp, name = "", type = "whatsapp") => {
    return await apiClient("/customer/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp, type }),
    });
  },
  updateName: async (name, gender, refer) => {
    const payload = { name, gender };
    if (refer) payload.refer = refer;
    return await apiClient("/customer/update-name", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  // Edit an existing customer's profile. Unlike update-name (one-time set),
  // this endpoint allows re-updating. Maps: {{base_url}}/customer/profile/update
  // Only non-empty fields are sent: the backend validates email/gender, so
  // passing "" for a not-yet-set value would fail ("email must be valid" /
  // "selected gender is invalid").
  updateProfile: async ({ name, email, gender }) => {
    const payload = { name };
    if (email) payload.email = email;
    if (gender) payload.gender = gender;
    return await apiClient("/customer/profile/update", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getBookings: async () => {
    return await apiClient("/customer/bookings");
  },
  // Read-only customer profile. Maps: {{base_url}}/customer/profile
  getProfile: async () => {
    return await apiClient("/customer/profile", {
      method: "GET",
    });
  },
  // Monthly subscription info content, keyed by service type ("cleaner" | "cook").
  // Maps: {{base_url}}/app/subscription-benefits?type=<type>
  getSubscriptionBenefits: async (type) => {
    return await apiClient(
      `/app/subscription-benefits?type=${encodeURIComponent(type)}`,
      { method: "GET" },
    );
  },
  // Maps: {{base_url}}/app/why-choose?type=<type>
  getWhyChoose: async (type) => {
    return await apiClient(
      `/app/why-choose?type=${encodeURIComponent(type)}`,
      { method: "GET" },
    );
  },
  // Maps: {{base_url}}/app/subscription-policies?type=<type>
  getSubscriptionPolicies: async (type) => {
    return await apiClient(
      `/app/subscription-policies?type=${encodeURIComponent(type)}`,
      { method: "GET" },
    );
  },
  // Top savings banner image for the subscription details. Maps:
  // {{base_url}}/app/savings-banner
  getSavingsBanner: async () => {
    return await apiClient("/app/savings-banner", { method: "GET" });
  },
  getBookingById: async (id) => {
    return await apiClient(`/customer/bookings/${id}`);
  },
  // Fetch the active service code the worker generated for a booking so the
  // customer can read it out to start/close the service.
  // Maps: {{base_url}}/booking/active-code?booking_id=<id>&role=customer
  getActiveCode: async (bookingId, role = "customer") => {
    const params = new URLSearchParams({
      booking_id: bookingId,
      role,
    });
    return await apiClient(`/booking/active-code?${params.toString()}`, {
      method: "GET",
    });
  },
  createAddress: async (payload) => {
    return await apiClient("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getAddresses: async () => {
    return await apiClient("/addresses", {
      method: "GET",
    });
  },
  getAddressById: async (id) => {
    return await apiClient(`/address/${id}`, {
      method: "GET",
    });
  },
  updateAddress: async (id, payload) => {
    return await apiClient(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  setDefaultAddress: async (id) => {
    return await apiClient(`/addresses/${id}/default`, {
      method: "PATCH",
    });
  },
  deleteAddress: async (id) => {
    return await apiClient(`/addresses/${id}`, {
      method: "DELETE",
    });
  },
  submitRating: async (payload) => {
    return await apiClient("/ratings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  checkInstantWorkers: async (date) => {
    const query = date ? `?date=${date}` : "";
    return await apiClient(`/instant_workers${query}`, {
      method: "GET",
    });
  },
  // Fetch available time slots for a given date + service category + service.
  // Maps: {{base_url}}/api/slots?date=YYYY-MM-DD&category_id=<id>&service_id=<id>
  getSlots: async (date, categoryId, serviceId) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (categoryId != null && categoryId !== "") {
      params.set("category_id", categoryId);
    }
    if (serviceId != null && serviceId !== "") {
      params.set("service_id", serviceId);
    }
    const query = params.toString();
    return await apiClient(`/slots${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  },
  // Fetch subscription plans (15 / 30 day durations + pricing) for a service.
  // Maps: {{base_url}}/customer/services/<service_id>/plans
  getServicePlans: async (serviceId) => {
    return await apiClient(`/customer/services/${serviceId}/plans`, {
      method: "GET",
    });
  },
  // Fetch the booking instructions for a subscription type. Response shape:
  // { success, data: { subscription_id, heading, instructions: [{ id, order, text }] } }
  // Maps: {{base_url}}/app/booking-instructions?subscription_id=<id>
  getBookingInstructions: async (subscriptionId) => {
    return await apiClient(
      `/app/booking-instructions?subscription_id=${encodeURIComponent(
        subscriptionId,
      )}`,
      { method: "GET" },
    );
  },
  checkPincode: async (pincode) => {
    return await apiClient("/pincodes/check", {
      method: "POST",
      body: JSON.stringify({ pincode }),
    });
  },
  getCoupons: async () => {
    return await apiClient("/user/coupons", {
      method: "GET",
    });
  },
  extendBooking: async (bookingId, extensionServiceId) => {
    return await apiClient(`/customer/bookings/${bookingId}/extend`, {
      method: "POST",
      body: JSON.stringify({ extension_service_id: extensionServiceId }),
    });
  },
  getBookingExtensionOptions: async (bookingId) => {
    return await apiClient(
      `/customer/bookings/${bookingId}/extension-options`,
      {
        method: "GET",
      },
    );
  },
  rescheduleMonthly: async (bookingId, payload) => {
    return await apiClient(
      `/customer/bookings/${bookingId}/reschedule-monthly`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
  pauseSubscription: async (bookingId, payload) => {
    return await apiClient(
      `/customer/bookings/${bookingId}/subscription/pause`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
  cancelBooking: async (bookingId) => {
    return await apiClient(`/customer/bookings/${bookingId}/cancel`, {
      method: "POST",
    });
  },

  getRescheduleHistory: async (bookingId) => {
    return await apiClient(
      `/customer/bookings/${bookingId}/reschedule-history`,
    );
  },
  getInstantExtensionHistory: async (bookingId) => {
    return await apiClient(`/instant-bookings/${bookingId}/extensions`, {
      method: "GET",
    });
  },

  getReferralLink: async () => {
    return await apiClient("/referral/my-link", {
      method: "GET",
    });
  },

  // Fetch user's referral stats (points, referrals list etc.)
  // Uses /api/referral/earnings as provided
  getReferralStats: async (token) => {
    const suffix = token ? `?token=${encodeURIComponent(token)}` : "";
    return await apiClient(`/referral/earnings${suffix}`, {
      method: "GET",
    });
  },
  requestDeleteAccount: async (payload) => {
    return await apiClient("/delete-account-request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
