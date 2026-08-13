const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Download = sequelize.define(
    "Download",
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        category: {
            type: DataTypes.ENUM("form", "brochure", "document", "report", "other"),
            defaultValue: "document",
        },
        file: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        fileType: {
            type: DataTypes.STRING,
            defaultValue: "pdf",
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active",
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "downloads",
    }
);

module.exports = Download;
