require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        if (process.env.NODE_ENV === 'production') {
            await sequelize.sync();
            console.log("Database checked successfully (Production mode - no auto-alter).");
        } else {
            await sequelize.sync({ alter: true });
            console.log("Database synced successfully.");
        }

        if (typeof (PhusionPassenger) !== "undefined") {
            app.listen("passenger");
        } else {
            app.listen(PORT, "0.0.0.0", () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
