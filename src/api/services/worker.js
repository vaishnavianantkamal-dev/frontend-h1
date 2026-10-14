import { apiClient } from "../client";

export const workerService = {
  sendOTP: async (phone, type = "whatsapp") => {
    return await apiClient("/worker/login/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, type }),
    });
  },
  verifyOTP: async (phone, otp, type = "whatsapp") => {
    return await apiClient("/worker/login/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp, type }),
    });
  },
  getProfile: async () => {
    return await apiClient("/worker/me", {
      method: "GET",
    });
  },
  getBookings: async (status) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return await apiClient(`/worker/bookings${query}`, {
      method: "GET",
    });
  },
  getBankDetails: async () => {
    return await apiClient("/worker/bank-details", {
      method: "GET",
    });
  },
  updateBankDetails: async (payload) => {
    return await apiClient("/worker/update_bank_details", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  generateCodes: async (bookingId) => {
    return await apiClient("/booking/generate-codes", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId }),
    });
  },
  // Verify the code the customer received to start the service.
  // Maps: {{base_url}}/booking/verifycode/<booking_id>/start
  // Backend expects the value under the `otp` field.
  verifyStartCode: async (bookingId, code) => {
    return await apiClient(`/booking/verifycode/${bookingId}/start`, {
      method: "POST",
      body: JSON.stringify({ otp: code }),
    });
  },
  // End an in-progress service.
  // Maps: {{base_url}}/booking/end-service
  endService: async (bookingId) => {
    return await apiClient("/booking/end-service", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId }),
    });
  },
  updateProfileByAdmin: async (id, data) => {
    return await apiClient(`/admin/worker/${id}/update`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  register: async (data) => {
    return await apiClient("/worker/register_app", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getWithdrawalHistory: async (workerId) => {
    return await apiClient(`/withdrawal/${workerId}/history`, {
      method: "GET",
    });
  },
  requestWithdrawal: async (payload) => {
    return await apiClient("/worker/withdraw", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  uploadWorkerDocs: async (workerId, entries) => {
    const form = new FormData();
    entries.forEach((e) => {
      form.append("id_type[]", e.type);
      form.append("id_number[]", e.number);
      form.append("id_front[]", e.front);
      form.append("id_back[]", e.back);
    });
    return await apiClient(`/worker/${workerId}/docs`, {
      method: "POST",
      body: form,
    });
  },
  getRatings: async (workerId, page = 1) => {
    return await apiClient(`/workers/${workerId}/ratings?page=${page}`, {
      method: "GET",
    });
  },
  updateLocation: async (bookingId, latitude, longitude) => {
    return await apiClient("/worker/location", {
      method: "POST",
      body: JSON.stringify({
        booking_id: bookingId,
        latitude,
        longitude,
      }),
    });
  },
  getRescheduleHistory: async (bookingId) => {
    return await apiClient(`/customer/bookings/${bookingId}/reschedule-history`, {
      method: "GET",
    });
  },
  getInstantExtensions: async (bookingId) => {
    return await apiClient(`/instant-bookings/${bookingId}/extensions`, {
      method: "GET",
    });
  },
  getReferralLink: async () => {
    return await apiClient("/referral/my-link", {
      method: "GET",
    });
  },
};
