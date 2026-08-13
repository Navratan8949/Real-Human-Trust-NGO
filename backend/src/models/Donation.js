const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Donation = sequelize.define(
    "Donation",
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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        campaignId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        fullName: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        email: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        phone: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        purpose: {
            type: DataTypes.STRING,
            defaultValue: "General Fund",
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        upiId: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        paymentId: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        transactionId: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        paymentProof: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        receiptNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        paymentStatus: {
            type: DataTypes.ENUM("pending", "success", "failed", "verified", "rejected"),
            defaultValue: "pending",
        },
        message: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
    },
    {
        timestamps: true,
        tableName: "donations",
    }
);

module.exports = Donation;