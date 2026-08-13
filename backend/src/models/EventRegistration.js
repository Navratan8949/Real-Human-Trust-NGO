const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EventRegistration = sequelize.define(
    "EventRegistration",
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
            allowNull: true,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("registered", "approved", "cancelled"),
            defaultValue: "registered",
        },
        remarks: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
    },
    {
        timestamps: true,
        tableName: "event_registrations",
    }
);

module.exports = EventRegistration;