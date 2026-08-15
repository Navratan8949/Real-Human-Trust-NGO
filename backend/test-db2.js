const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("ngo_db", "root", "", { host: "localhost", dialect: "mysql", logging: false });
async function check() {
  const [results] = await sequelize.query("SHOW INDEXES FROM users;");
  console.log(results.map(r => r.Key_name));
  process.exit(0);
}
check();
