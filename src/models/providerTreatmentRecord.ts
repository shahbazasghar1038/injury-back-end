// src/models/providerTreatmentRecordModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust path if needed
import Case from "./caseModel"; // Import the Case model
import User from "./userModel"; // Import the User model

class ProviderTreatmentRecord extends Model {
  public id!: number;
  public caseId!: number;
  public userId!: number;
  public treatmentStatus!: string;
  public bill!: string;
  public recordRequest!: string; // Default to "Pending"
  public medicalRecord!: string | null; // New field for medical records (File URL)
  public medicalBills!: string | null; // New field for medical bills (File URL)
  public BillRequest!: string; // Default to "Pending"
  public doctorAcceptanceStatus!: string; // New field for doctor acceptance status
  public reducedAmount!: string; // New field for reduced amount
  public createdAt!: Date;
  public updatedAt!: Date;
}

ProviderTreatmentRecord.init(
  {
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Cases", // Foreign key reference to the 'Cases' table
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Foreign key reference to the 'Users' table
        key: "id",
      },
    },
    treatmentStatus: {
      type: DataTypes.STRING,
      allowNull: true, // Optional treatment status
      defaultValue: "Pending", // Default to "Pending"
    },
    bill: {
      type: DataTypes.STRING,
      allowNull: true, // Optional bill information
    },
    medicalRecord: {
      type: DataTypes.STRING,
      allowNull: true, // Nullable file URL for medical records
    },
    medicalBills: {
      type: DataTypes.STRING,
      allowNull: true, // Nullable file URL for medical bills
    },
    recordRequest: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Pending", // Default to "Pending"
    },
    BillRequest: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Pending", // Default to "Pending"
    },
    doctorAcceptanceStatus: {
      type: DataTypes.ENUM("Pending", "Requested", "Accepted", "Rejected"),
      allowNull: true,
      defaultValue: "Pending", // Default to "Pending"
    },
    reducedAmount: {
      type: DataTypes.STRING,
      allowNull: true, // Optional bill information
    },
  },
  { sequelize, modelName: "ProviderTreatmentRecord" }
);

// Define associations
ProviderTreatmentRecord.belongsTo(Case, {
  foreignKey: "caseId",
  as: "case", // Alias for case details
});

ProviderTreatmentRecord.belongsTo(User, {
  foreignKey: "userId",
  as: "user", // Alias for user details
});

export default ProviderTreatmentRecord;
