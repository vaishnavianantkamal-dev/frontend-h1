import { apiClient } from "../client";

export const settingsService = {
  // Fetch platform-wide charges (platform fee, GST %, travelling & rain charge).
  // Maps: {{base_url}}/settings/charges
  getCharges: async () => {
    return await apiClient("/settings/charges", {
      method: "GET",
    });
  },
};
