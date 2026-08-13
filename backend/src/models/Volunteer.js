const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Volunteer = sequelize.define(
    "Volunteer",
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
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true, // true to not break existing data
        },
        volunteerId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        profileImage: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        bloodGroup: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        message: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            defaultValue: "pending",
        },
    },
    {
        timestamps: true,
        tableName: "volunteers",
    }
);

module.exports = Volunteer;