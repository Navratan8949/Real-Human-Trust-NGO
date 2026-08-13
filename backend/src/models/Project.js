const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Project = sequelize.define(
    "Project",
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
        goalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
        raisedAmount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM("active", "completed", "upcoming"),
            defaultValue: "active",
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "projects",
    }
);

module.exports = Project;