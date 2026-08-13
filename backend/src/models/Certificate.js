const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Certificate = sequelize.define(
    "Certificate",
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
        certificateNo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        pdf: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        issueDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.ENUM("active", "cancelled"),
            defaultValue: "active",
        },
    },
    {
        timestamps: true,
        tableName: "certificates",
    }
);

module.exports = Certificate;