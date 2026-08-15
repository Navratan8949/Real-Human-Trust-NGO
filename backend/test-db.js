const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("ngo_db", "root", "", { host: "localhost", dialect: "mysql", logging: false });
async function check() {
  const [results] = await sequelize.query("SELECT TABLE_NAME, COUNT(1) index_count FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='ngo_db' GROUP BY TABLE_NAME ORDER BY index_count DESC;");
  console.log(results);
  process.exit(0);
}
check();
