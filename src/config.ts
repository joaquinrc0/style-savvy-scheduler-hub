// Centralized API config for robust environment handling

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === "development") {
    // Use localhost for dev
    return "http://localhost:8000/django";
  }
  // In production, use same-origin (or set your real API base URL here)
  return "/django";
};

export const API_BASE_URL = getApiBaseUrl();
