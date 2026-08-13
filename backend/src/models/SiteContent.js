const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SiteContent = sequelize.define(
    "SiteContent",
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
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        content: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        content_hi: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        content_gu: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        image: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        updatedById: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "site_contents",
    }
);

module.exports = SiteContent;
