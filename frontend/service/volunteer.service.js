import api from "./api";
import { setStoredSession } from "@/lib/auth-storage";

// Create Volunteer
export const createVolunteer = async (data) => {
    try {
        const response = await api.post("/volunteers", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get All Volunteers
export const getVolunteers = async (params) => {
    try {
        const response = await api.get("/volunteers", { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get Volunteer by ID
export const getVolunteerById = async (id) => {
    try {
        const response = await api.get(`/volunteers/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update Volunteer
export const updateVolunteer = async (id, data) => {
    try {
        const response = await api.put(`/volunteers/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete Volunteer
export const deleteVolunteer = async (id) => {
    try {
        const response = await api.delete(`/volunteers/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const applyVolunteer = async (data) => {
    try {
        const response = await api.post("/volunteers/apply", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const loginVolunteer = async (data) => {
    try {
        const response = await api.post("/volunteers/login", data);
        if (response.data.token) {
            setStoredSession({
                token: response.data.token,
                user: response.data.user,
                role: "volunteer",
            });
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};
