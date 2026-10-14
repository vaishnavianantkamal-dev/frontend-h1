import { apiClient } from "../client";

// The weather endpoint only supports coordinates with 6 decimal places; a
// higher precision (e.g. 7 decimals) is rejected with
// "latitude longitude not supported". toFixed(6) keeps exactly 6 decimals
// (including trailing zeros) so the format matches what the backend expects.
const toCoord = (value) => Number(value).toFixed(6);

export const weatherService = {
  // Resolve current weather + rain charge for a location.
  // Maps: {{base_url}}/weather/condition?location=<lat>,<long>
  getCondition: async (lat, long) => {
    const location = `${toCoord(lat)},${toCoord(long)}`;
    return await apiClient(`/weather/condition?location=${location}`, {
      method: "GET",
    });
  },
};
