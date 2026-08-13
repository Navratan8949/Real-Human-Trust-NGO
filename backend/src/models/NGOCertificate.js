const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NGOCertificate = sequelize.define(
    "NGOCertificate",
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
        certificateNo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        issuedBy: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "",
        },
        issueDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        template: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "",
        },
        sealImage: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        backgroundImage: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        pdf: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        image: {
            type: DataTypes.JSON,
            defaultValue: { public_id: "", url: "" },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        timestamps: true,
        tableName: "ngo_certificates",
    }
);

module.exports = NGOCertificate;
