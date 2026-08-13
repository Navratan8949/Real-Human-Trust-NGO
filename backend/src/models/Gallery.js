const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Gallery = sequelize.define(
    "Gallery",
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
        type: {
            type: DataTypes.ENUM("photo", "video"),
            allowNull: false,
        },
        image: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        videoUrl: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: "",
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
        tableName: "galleries",
    }
);

module.exports = Gallery;