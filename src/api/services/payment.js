import { apiClient } from "../client";

export const paymentService = {
  createOrder: async (bookingId, couponCode = null, cityId = null) => {
    const payload = { booking_id: bookingId };
    if (couponCode) payload.coupon_code = couponCode;
    if (cityId != null && cityId !== "") payload.city_id = cityId;

    return apiClient("/payment/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyPayment: async (payload) => {
    return apiClient("/payment/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
