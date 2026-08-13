const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Event = sequelize.define(
    "Event",
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
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        eventDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        registrationLastDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        maxParticipants: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM("upcoming", "ongoing", "completed", "cancelled"),
            defaultValue: "upcoming",
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: "events",
    }
);

module.exports = Event;