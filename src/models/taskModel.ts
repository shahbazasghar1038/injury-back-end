// src/models/taskModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust path if needed
import Case from "./caseModel"; // Import Case model

class Task extends Model {
  public id!: number;
  public taskTitle!: string;
  public status!: string; // Enum: 'Open', 'In Progress', 'Completed'
  public description!: string;
  public files!: string; // Can store URLs or file names
  public caseId!: number; // Foreign key to Case
  public createdAt!: Date;
  public updatedAt!: Date;
}

Task.init(
  {
    taskTitle: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Completed"),
      allowNull: false,
      defaultValue: "Open",
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    files: { type: DataTypes.STRING, allowNull: true }, // For file URLs
    caseId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Cases", // References the Case model
        key: "id",
      },
      allowNull: false,
    },
  },
  { sequelize, modelName: "Task" }
);

// Association: Each task belongs to one case
Task.belongsTo(Case, { foreignKey: "caseId" });

export default Task;
