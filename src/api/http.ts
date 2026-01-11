import axios from "axios";

/**
 * Central HTTP client for the application
 * - Attaches JWT automatically
 * - Handles auth failures globally
 */
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://todoapi-tcbd.onrender.com",
    headers: {
        "Content-Type": "application/json",
    },
});

// Debug: Log the actual base URL being used
console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

/**
 * Request interceptor – attach JWT
 */
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Response interceptor – handle auth errors
 */
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default http;
