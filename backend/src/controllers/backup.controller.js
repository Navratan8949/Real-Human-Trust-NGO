const models = require("../models");

exports.getDatabaseBackup = async (req, res) => {
    try {
        const backupData = {};
        const modelKeys = Object.keys(models).filter(key => key !== "sequelize" && models[key].findAll);

        for (const modelName of modelKeys) {
            const data = await models[modelName].findAll();
            backupData[modelName] = data;
        }

        res.status(200).json({
            success: true,
            backupDate: new Date().toISOString(),
            tables: Object.keys(backupData).length,
            data: backupData,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
