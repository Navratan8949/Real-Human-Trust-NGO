const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("ngo_db", "root", "", { host: "localhost", dialect: "mysql", logging: false });
async function get() {
  const [results] = await sequelize.query("SELECT content FROM site_contents WHERE `key` = 'donate_details'");
  console.log(results[0].content);
  process.exit(0);
}
get();
