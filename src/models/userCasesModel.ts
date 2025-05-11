// src/models/userCasesModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust the path as needed

class UserCases extends Model {
  public userId!: number;
  public caseId!: number;
}

UserCases.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
      },
      allowNull: false,
    },
    caseId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Cases",
        key: "id",
      },
      allowNull: false,
    },
  },
  { sequelize, modelName: "UserCases" }
);

export default UserCases;
