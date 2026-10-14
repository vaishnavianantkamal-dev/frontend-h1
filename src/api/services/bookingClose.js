import { apiClient } from "../client";

export const bookingCloseService = {
  sendCloseOtp: async (bookingId, type = "whatsapp") => {
    return apiClient("/booking/send-close-otp", {
      method: "POST",
      body: JSON.stringify({ booking_id: bookingId, type }),
    });
  },
  verifyCloseOtp: async (bookingId, otp) => {
    return apiClient(`/booking/verifyotp/${bookingId}/close`, {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  },
};
