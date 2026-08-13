const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AppointmentLetter = sequelize.define(
    "AppointmentLetter",
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
        letterNo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        designation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        department: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        joiningDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        pdf: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        status: {
            type: DataTypes.ENUM("active", "expired", "cancelled"),
            defaultValue: "active",
        },
    },
    {
        timestamps: true,
        tableName: "appointment_letters",
    }
);

module.exports = AppointmentLetter;