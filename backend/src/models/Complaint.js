const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Complaint = sequelize.define(
    "Complaint",
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
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "in_progress", "resolved", "closed"),
            defaultValue: "pending",
        },
        reply: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        resolvedById: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "complaints",
    }
);

module.exports = Complaint;