const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Team = sequelize.define(
    "Team",
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        photo: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        email: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        phone: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        website: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        socialLinks: {
            type: DataTypes.JSON,
            defaultValue: { facebook: "", instagram: "", linkedin: "", twitter: "" },
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
        tableName: "teams",
    }
);

module.exports = Team;
