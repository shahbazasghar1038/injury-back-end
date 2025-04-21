import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust the path as needed

class User extends Model {
  public id!: number;
  public fullName!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public role!: "Doctor" | "Attorney";
  public otp!: string | null; // Added OTP field
  public otpExpiresAt!: number | null; // Added OTP expiry time field
  public isVerified!: boolean;
  // Other fields...
}

User.init(
  {
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("Doctor", "Attorney"), allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: true },
    otpExpiresAt: { type: DataTypes.BIGINT, allowNull: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: "User" }
);

export default User;
