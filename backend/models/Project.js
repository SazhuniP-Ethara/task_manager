const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Project = sequelize.define(
  "Project",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "Active",
        "Completed",
        "On Hold"
      ),
      defaultValue: "Active",
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = Project;