// src/models/intakeModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust the path as needed

class Intake extends Model {
  public id!: number;
  public fullName!: string;
  public dateOfBirth!: string;
  public phoneNumber!: string;
  public defendantInsurance!: string | null; // Can store URL of the uploaded file
  public accidentLocation!: string;
  public accidentDescription!: string;
  public injuries!: string;
  public weatherConditions!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Intake.init(
  {
    fullName: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.STRING, allowNull: false },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    defendantInsurance: { type: DataTypes.STRING, allowNull: true }, // Store file URL here
    accidentLocation: { type: DataTypes.TEXT, allowNull: false },
    accidentDescription: { type: DataTypes.TEXT, allowNull: false },
    injuries: { type: DataTypes.TEXT, allowNull: false },
    weatherConditions: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: "Intake" }
);

export default Intake;
