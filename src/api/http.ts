import axios from "axios";

/**
 * Central HTTP client for the application
 * - Attaches JWT automatically
 * - Handles auth failures globally
 */
const http = axios.create({
    baseURL: "/", // Use Vite proxy
    headers: {
        "Content-Type": "application/json",
    },
});

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
