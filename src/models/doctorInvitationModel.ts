// src/models/doctorInvitationModel.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust path if needed

class DoctorInvitation extends Model {
  public id!: number;
  public fullName!: string;
  public email!: string;
  public phone!: string;
  public speciality!: string;
  public role!: "Doctor"; // The role is fixed as "Doctor" since it's an invitation for a doctor
  public caseId!: number; // The case ID the doctor is invited to
  public status!: "Pending" | "Accepted" | "Expired"; // The status of the invitation
  public createdAt!: Date;
  public updatedAt!: Date;
}

DoctorInvitation.init(
  {
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: false },
    speciality: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.ENUM("Doctor"), allowNull: false },
    caseId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM("Pending", "Accepted", "Expired"),
      allowNull: false,
      defaultValue: "Pending",
    },
  },
  { sequelize, modelName: "DoctorInvitation" }
);

export default DoctorInvitation;
