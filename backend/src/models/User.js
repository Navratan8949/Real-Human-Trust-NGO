const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
    "User",
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
        profileImage: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        gender: {
            type: DataTypes.ENUM("male", "female", "other", ""),
            defaultValue: "",
        },
        dob: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        state: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        district: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        address: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        userType: {
            type: DataTypes.ENUM("donor", "volunteer", "supporter", "ngo_member", ""),
            defaultValue: "",
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("super_admin", "admin", "manager", "coordinator", "member"),
            defaultValue: "member",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        timestamps: true,
        tableName: "users",
    }
);

module.exports = User;