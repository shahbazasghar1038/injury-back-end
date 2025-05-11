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
  public speciality!: string | null; // Added speciality field
  public usercaseLimit!: number; // Added user case limit field
  public usercaseCount!: number; // Added user case count field

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
    speciality: { type: DataTypes.STRING, allowNull: true }, // Adding the speciality field
    usercaseLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 3, // Default value for user case count
    },
    usercaseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Default value for user case count
    },
  },
  { sequelize, modelName: "User" }
);

export default User;
