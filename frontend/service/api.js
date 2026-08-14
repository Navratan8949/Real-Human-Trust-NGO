import axios from "axios";
import { getStoredToken } from "@/lib/auth-storage";

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== "undefined" && 
        !window.location.hostname.includes("localhost") && 
        !window.location.hostname.includes("127.0.0.1") &&
        !window.location.hostname.startsWith("192.168.")) {
        return "https://realhumantrust.org/api/v1";
    }
    
    if (typeof window !== "undefined" && window.location.hostname) {
        return `http://${window.location.hostname}:5001/api/v1`;
    }
    return "http://localhost:5001/api/v1";
};

console.log('getBaseUrl:', getBaseUrl());

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const expectedRole = config.authRole;
            const token = getStoredToken(expectedRole);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (expectedRole) {
                delete config.headers.Authorization;
                config.withCredentials = false;
            }
        }
        delete config.authRole;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
