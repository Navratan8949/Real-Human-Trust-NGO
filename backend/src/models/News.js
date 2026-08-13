const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const News = sequelize.define(
    "News",
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
            allowNull: false,
        },
        image: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        category: {
            type: DataTypes.ENUM("news", "press_release"),
            defaultValue: "news",
        },
        status: {
            type: DataTypes.ENUM("draft", "published"),
            defaultValue: "published",
        },
        publishedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "news",
    }
);

module.exports = News;