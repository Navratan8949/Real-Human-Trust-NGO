const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Newsletter = sequelize.define(
    "Newsletter",
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: "",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        timestamps: true,
        tableName: "newsletters",
    }
);

module.exports = Newsletter;
