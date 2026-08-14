const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseURL = "http://localhost:5001/api/v1";
let token = "";

async function loginAdmin() {
    try {
        const res = await axios.post(`${baseURL}/auth/login/admin`, {
            email: "admin@example.com", // Assuming this exists or I need to create one
            password: "password123" // Assuming this is the password
        });
        token = res.data.token;
        console.log("Logged in successfully. Token acquired.");
    } catch (e) {
        console.error("Failed to login:", e.response?.data || e.message);
        // Let's try to setup admin if it fails
        if (e.response?.data?.message === "Invalid credentials" || e.response?.data?.message === "User not found") {
            console.log("Trying to setup admin...");
            try {
                const setupRes = await axios.post(`${baseURL}/auth/setup-admin`, {
                    fullName: "Test Admin",
                    email: "admin@test.com",
                    mobile: "1234567890",
                    password: "password123"
                });
                token = setupRes.data.token;
                console.log("Admin setup successful. Token acquired.");
            } catch (err) {
                 console.error("Failed to setup admin:", err.response?.data || err.message);
                 process.exit(1);
            }
        }
    }
}

async function testAwards() {
    console.log("--- Testing Awards ---");
    try {
        // Create
        let res = await axios.post(`${baseURL}/awards`, {
            title: "Test Award",
            awardedBy: "Test Org",
            year: 2024,
            status: "active"
        }, { headers: { Authorization: `Bearer ${token}` } });
        const awardId = res.data.award._id || res.data.award.id;
        console.log("Created Award:", awardId);

        // Update
        res = await axios.put(`${baseURL}/awards/${awardId}`, {
            title: "Updated Test Award"
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Updated Award:", res.data.award.title);

        // Delete
        res = await axios.delete(`${baseURL}/awards/${awardId}`, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Deleted Award:", res.data.message);
    } catch (e) {
        console.error("Awards Test Failed:", e.response?.data || e.message);
    }
}

async function testNGOCertificates() {
    console.log("--- Testing NGO Certificates ---");
    try {
        // Create
        let res = await axios.post(`${baseURL}/ngo-certificates`, {
            title: "Test NGO Certificate",
            certificateNo: "NGO123",
            issuedBy: "Gov",
            isActive: true
        }, { headers: { Authorization: `Bearer ${token}` } });
        const certId = res.data.certificate._id || res.data.certificate.id;
        console.log("Created NGO Cert:", certId);

        // Update
        res = await axios.put(`${baseURL}/ngo-certificates/${certId}`, {
            title: "Updated NGO Cert"
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Updated NGO Cert:", res.data.certificate.title);

        // Delete
        res = await axios.delete(`${baseURL}/ngo-certificates/${certId}`, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Deleted NGO Cert:", res.data.message);
    } catch (e) {
        console.error("NGO Certificates Test Failed:", e.response?.data || e.message);
    }
}

async function run() {
    await loginAdmin();
    await testAwards();
    await testNGOCertificates();
}

run();
