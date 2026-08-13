const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Member = sequelize.define(
    "Member",
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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        memberId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        profileImage: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        idProof: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        paymentScreenshot: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        bloodGroup: {
            type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""),
            defaultValue: "",
        },
        occupation: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        membershipType: {
            type: DataTypes.ENUM("general", "lifetime", "honorary", "student"),
            defaultValue: "general",
        },
        joiningDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        membershipStatus: {
            type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
            defaultValue: "pending",
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        qrCode: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        appointmentLetter: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        referredById: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        timestamps: true,
        tableName: "members",
    }
);

module.exports = Member;