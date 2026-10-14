import { apiClient } from "../client";

export const bookingService = {
  createBooking: async (payload) => {
    return apiClient("/web_booking", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getTrackingData: async (bookingId) => {
    return await apiClient(`/track/map_data/${bookingId}`, {
      method: "GET",
    });
  },
  updateBookingStatus: async (bookingId, status) => {
    return apiClient(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
