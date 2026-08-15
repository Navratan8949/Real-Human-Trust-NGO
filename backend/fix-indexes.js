const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("ngo_db", "root", "", { host: "localhost", dialect: "mysql", logging: false });
async function fix() {
  const [tables] = await sequelize.query("SHOW TABLES;");
  for (let t of tables) {
    const tableName = Object.values(t)[0];
    const [indexes] = await sequelize.query(`SHOW INDEXES FROM ${tableName};`);
    const indexNames = [...new Set(indexes.map(i => i.Key_name))];
    for (let idx of indexNames) {
      if (idx !== 'PRIMARY' && /\_\d+$/.test(idx)) {
        console.log(`Dropping ${idx} from ${tableName}`);
        await sequelize.query(`ALTER TABLE ${tableName} DROP INDEX ${idx};`).catch(e => console.log(e.message));
      }
    }
  }
  process.exit(0);
}
fix();
