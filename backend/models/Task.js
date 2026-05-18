const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define(
  "Task",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    priority: {
      type: DataTypes.ENUM(
        "Low",
        "Medium",
        "High"
      ),
      defaultValue: "Medium",
    },

    status: {
      type: DataTypes.ENUM(
        "Pending",
        "In Progress",
        "Completed"
      ),
      defaultValue: "Pending",
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    assignedMember: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    project: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Task;