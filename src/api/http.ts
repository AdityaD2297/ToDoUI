import axios from "axios";

/**
 * Central HTTP client for the application
 * - Attaches JWT automatically
 * - Handles auth failures globally
 */
const http = axios.create({
    baseURL: "/", // Use relative path for both dev and prod
    headers: {
        "Content-Type": "application/json",
    },
});

// Debug: Log the actual configuration
console.log("Environment:", import.meta.env.MODE);
console.log("API Base URL:", http.defaults.baseURL);

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
