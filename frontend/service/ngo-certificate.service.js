import api from "./api";

export const getNGOCertificates = async () => {
    try {
        const response = await api.get("/ngo-certificates");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getNGOCertificateById = async (id) => {
    try {
        const response = await api.get(`/ngo-certificates/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
