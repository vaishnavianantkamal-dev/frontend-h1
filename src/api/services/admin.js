import { apiClient } from "../client";

export const adminService = {
  /**
   * Fetch dashboard counts (total bookings, customers, workers)
   */
  getDashboardCounts: () => apiClient("/dashboard/counts"),

  /**
   * Fetch all service categories
   */
  getServiceCategories: () => apiClient("/service-categories"),

  /**
   * Fetch single service category with its services
   * @param {number|string} id
   */
  getServiceCategory: (id) => apiClient(`/service-categories/${id}`),

  /**
   * Fetch all services
   * @param {number|string} [categoryId] - Optional category ID to filter by (if supported by API, otherwise filter client-side)
   */
  getServices: async (categoryId) => {
    // If the API supports query params, we could add them here.
    // For now, we fetch all and let the component filter, or just return the promise.
    const response = await apiClient("/services");
    // Handle both direct array and wrapped response formats
    return Array.isArray(response) ? response : response.data || [];
  },

  /**
   * Fetch all cities
   */
  getCities: async () => {
    const response = await apiClient("/cities");
    return Array.isArray(response) ? response : response.data || [];
  },

  /**
   * Fetch all zones
   */
  getZones: async () => {
    const response = await apiClient("/zones");
    return Array.isArray(response) ? response : response.data || [];
  },

  /**
   * Fetch all serviceable areas
   */
  getAreas: async () => {
    const response = await apiClient("/serviceable-areas");
    return Array.isArray(response) ? response : response.data || [];
  },

  getSubscriptionTypes: async () => {
    const response = await apiClient("/subscription-types");
    return Array.isArray(response) ? response : response.data || [];
  },

  /**
   * Fetch Do's & Don'ts (guidelines) for a specific service
   * @param {number|string} serviceId
   */
  getServiceGuidelines: async (serviceId) => {
    if (!serviceId) throw new Error("Service ID is required");
    const response = await apiClient(`/services/${serviceId}/dos-donts`, {
      method: "GET",
    });
    return response?.data || response;
  },

  /**
   * Fetch all standard add-on services
   */
  getAddons: async () => {
    const response = await apiClient("/addons");
    return Array.isArray(response) ? response : response.data || [];
  },
};
