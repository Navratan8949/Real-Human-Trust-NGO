const axios = require('axios');
async function test() {
  try {
    // 1. Login as volunteer
    console.log("Logging in as volunteer...");
    const loginRes = await axios.post("https://realhumantrust.org/api/v1/volunteers/login", {
      emailOrMobile: "volunteer@example.com", // Just a fake one to see error
      password: "password123"
    });
    console.log("Login success:", loginRes.data);
  } catch (err) {
    console.log("Login failed:", err.response?.data);
  }
}
test();
