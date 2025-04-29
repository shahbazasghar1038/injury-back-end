import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust path if needed

class Case extends Model {
  public id!: number;
  public fullName!: string;
  public email!: string;
  public phone!: string;
  public dateOfBirth!: string;
  public dateOfAccident!: string;
  public gender!: string;
  public streetAddress!: string;
  public status!: string;
  public paymentStatus!: string;
  public isPaidCase!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Case.init(
  {
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.STRING, allowNull: false },
    dateOfAccident: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.STRING, allowNull: false },
    streetAddress: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Closed", "Paid"),
      allowNull: false,
      defaultValue: "Open",
    },
    paymentStatus: {
      type: DataTypes.ENUM("Unpaid", "Paid"),
      allowNull: false,
      defaultValue: "Unpaid",
    },
    isPaidCase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  { sequelize, modelName: "Case" }
);

export default Case;
