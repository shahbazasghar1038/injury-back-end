// src/models/archivedCaseModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust path if needed
import Case from "./caseModel"; // Import Case model for association
import User from "./userModel"; // Import User model for association

class ArchivedCase extends Model {
  public id!: number;
  public caseId!: number;
  public archivedAt!: Date;
  public reason!: string;
  public userId!: number; // Added userId to reference the user who archived the case
  public createdAt!: Date;
  public updatedAt!: Date;
}

ArchivedCase.init(
  {
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Cases", // Foreign key reference to the 'Cases' table
        key: "id",
      },
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true, // Optional reason for archiving
    },
    userId: {
      // Foreign key to reference User
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Foreign key reference to the 'Users' table
        key: "id",
      },
    },
  },
  { sequelize, modelName: "ArchivedCase" }
);

// Define the relationships
ArchivedCase.belongsTo(Case, {
  foreignKey: "caseId",
  as: "case", // Alias for accessing the associated case
});

ArchivedCase.belongsTo(User, {
  foreignKey: "userId",
  as: "user", // Alias for accessing the associated user
});

export default ArchivedCase;
