const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  try {
    fs.writeFileSync('test.jpg', 'fake image content');

    // login
    const loginRes = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'superadmin@gmail.com', // wait, do I know the email? I'll check DB
      password: 'password123'
    });
  } catch (err) {
    console.log(err.message);
  }
}
test();
