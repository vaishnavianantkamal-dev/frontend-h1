export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const isFormData = options?.body instanceof FormData;
  const defaultHeaders = isFormData
    ? {
        Accept: "application/json",
      }
    : {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

  const token = localStorage.getItem("token");
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      console.warn("Unauthorized access");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`,
      );
    }
    if (response.status === 204) {
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
};
