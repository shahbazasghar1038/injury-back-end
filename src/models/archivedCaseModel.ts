// src/models/archivedCaseModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust path if needed
import Case from "./caseModel"; // Import Case model for association

class ArchivedCase extends Model {
  public id!: number;
  public caseId!: number;
  public archivedAt!: Date;
  public reason!: string;
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
  },
  { sequelize, modelName: "ArchivedCase" }
);
ArchivedCase.belongsTo(Case, {
  foreignKey: "caseId",
  as: "case", // Alias for accessing the associated case
});
export default ArchivedCase;
