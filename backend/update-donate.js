const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("ngo_db", "root", "", { host: "localhost", dialect: "mysql", logging: false });
async function update() {
  const contentJSON = JSON.stringify({
    bankName: "Kotak Mahindra Bank",
    accountName: "REAL HUMAN EDUCATION AND CHARITABLE TRUST RAJKOT",
    accountNumber: "1449582492",
    ifscCode: "KKBK0002794",
    upiId: "hirenbhai.joshi03@kotak",
    qrImage: "/public/uploads/qr_image-1786684061496.jpg", // default mock or current if available
    branchName: "Kalavad Road, Rajkot",
    crnNo: "914976014"
  });
  
  await sequelize.query("UPDATE site_contents SET content = ? WHERE `key` = 'donate_details'", { replacements: [contentJSON] });
  console.log("Updated DB");
  process.exit(0);
}
update();
