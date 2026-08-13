const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Award = sequelize.define(
    "Award",
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
        awardedBy: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        image: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
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
        tableName: "awards",
    }
);

module.exports = Award;
