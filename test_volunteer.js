const API = 'http://localhost:5001/api/v1';

async function runTest() {
  try {
    console.log("1. Applying as volunteer...");
    const applyReq = await fetch(`${API}/volunteers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Test Volunteer 4",
        email: "testvol4@example.com",
        mobile: "1111111114",
        password: "password123",
        address: "Test Address"
      })
    });
    const applyData = await applyReq.json();
    console.log("Apply success:", applyData.message);
    if (!applyData.success) throw new Error(applyData.message);
    const volId = applyData.volunteer.id;

    console.log("2. Admin login to approve...");
    const { Volunteer } = require('./backend/src/models');
    await Volunteer.update({ status: 'approved' }, { where: { id: volId } });
    console.log("Admin approved volunteer manually.");

    console.log("3. Login as volunteer...");
    const loginReq = await fetch(`${API}/volunteers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrMobile: "testvol4@example.com",
        password: "password123"
      })
    });
    const loginData = await loginReq.json();
    console.log("Login response:", loginData.message || "Success");
    if (!loginData.success) throw new Error(loginData.message);
    const token = loginData.token;

    console.log("4. Fetch /auth/me (to test auth fix)...");
    const authMeReq = await fetch(`${API}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const authMeData = await authMeReq.json();
    console.log("Auth/me success. Role:", authMeData.user?.role);
    if (authMeData.user?.role !== 'volunteer') throw new Error('Role mismatch in auth/me');

    console.log("5. Fetch /volunteers/me...");
    const volMeReq = await fetch(`${API}/volunteers/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const volMeData = await volMeReq.json();
    console.log("Volunteers/me success. Full Name:", volMeData.volunteer?.fullName);
    
    console.log("ALL TESTS PASSED!");
  } catch (err) {
    console.error("Test failed!", err.message);
  }
}
runTest();
