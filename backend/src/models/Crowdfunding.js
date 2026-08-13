const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Crowdfunding = sequelize.define(
    "Crowdfunding",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        _id: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.getDataValue("id");
            },
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        image: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        targetAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        raisedAmount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "completed", "closed"),
            defaultValue: "active",
        },
    },
    {
        timestamps: true,
        tableName: "crowdfunding_campaigns",
    }
);

module.exports = Crowdfunding;