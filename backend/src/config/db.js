const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

const useMySQL = Boolean(process.env.MYSQL_DATABASE && process.env.MYSQL_USER);
const dbDialect = process.env.DB_DIALECT || (useMySQL ? "mysql" : "sqlite");

let sequelize;

if (dbDialect === "mysql") {
    const dbName = process.env.MYSQL_DATABASE || "ngo_db";
    const dbUser = process.env.MYSQL_USER || "root";
    const dbPassword = process.env.MYSQL_PASSWORD || "";
    const dbHost = process.env.MYSQL_HOST || "localhost";
    const dbPort = parseInt(process.env.MYSQL_PORT || "3306", 10);

    sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: "mysql",
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    });
} else {
    const storageDir = path.join(__dirname, "..", "..", "data");
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }
    const storagePath = path.join(storageDir, "database.sqlite");
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: storagePath,
        logging: false,
    });
}

const connectDB = async () => {
    try {
        if (dbDialect === "mysql") {
            const mysql = require("mysql2/promise");
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST || "localhost",
                port: parseInt(process.env.MYSQL_PORT || "3306", 10),
                user: process.env.MYSQL_USER || "root",
                password: process.env.MYSQL_PASSWORD || "",
            });
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || "ngo_db"}\`;`);
            await connection.end();
        }
        await sequelize.authenticate();
        console.log(`Database (${dbDialect.toUpperCase()}) connected successfully.`);
    } catch (error) {
        console.error("Database connection error:", error.message);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
