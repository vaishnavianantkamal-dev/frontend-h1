const APP_BASE = (
  import.meta.env.VITE_APP_BASE_URL || "https://hobitadmin.hobit.club"
).replace(/\/$/, "");

export const IMAGE_BASE_URL = (
  import.meta.env.VITE_APP_BASE_URL || `${APP_BASE}/public`
).replace(/\/$/, "");

export const ORIGIN = APP_BASE;

export const getImageUrl = (path) => {
  if (!path) return null;

  if (typeof path !== "string") return path;

  // Remove extra backticks, spaces, and normalize slashes
  const cleanPath = path
    .trim()
    .replace(/^`+|`+$/g, "")
    .replace(/\\/g, "/"); // Convert backslashes to forward slashes

  if (cleanPath.startsWith("blob:")) return cleanPath;

  if (cleanPath.startsWith("http")) {
    if (cleanPath.includes("storage/app/public/")) {
      const cleanBaseUrl = APP_BASE;

      const idx = cleanPath.indexOf("storage/app/public/");
      const relative = cleanPath.slice(idx).replace("storage/app/public/", "storage/");
      const finalUrl = `${cleanBaseUrl}/${relative}`;
      return finalUrl.replace(/([^:]\/)\/+/g, "$1");
    }

    // Other http(s) URLs: return as-is
    return cleanPath;
  }

  const cleanBaseUrl = APP_BASE;

  let finalUrl = "";

  // Handle paths starting with storage/ or /storage/
  if (cleanPath.startsWith("storage/app/public/")) {
    // Map to {base}/storage/... (the "app/public" segment isn't web-served)
    finalUrl = `${cleanBaseUrl}/${cleanPath.replace("storage/app/public/", "storage/")}`;
  } else if (cleanPath.startsWith("storage/")) {
    finalUrl = `${cleanBaseUrl}/${cleanPath}`;
  } else if (cleanPath.startsWith("/storage/")) {
    finalUrl = `${cleanBaseUrl}${cleanPath}`;
  } else {
    // Fallback for paths like "uploads/..." that need the storage base URL
    const normalizedPath = cleanPath.startsWith("/")
      ? cleanPath
      : `/${cleanPath}`;
    finalUrl = `${cleanBaseUrl}/storage${normalizedPath}`;
  }

  // Fix double slashes except after protocol (e.g. http://)
  return finalUrl.replace(/([^:]\/)\/+/g, "$1");
};
