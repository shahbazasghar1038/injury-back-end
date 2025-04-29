import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust the path as needed
import User from "./userModel";

class Address extends Model {
  public id!: number;
  public streetAddress!: string;
  public state!: string;
  public zipCode!: string;
  public userId!: number;
}

Address.init(
  {
    streetAddress: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    zipCode: { type: DataTypes.STRING, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
    },
  },
  { sequelize, modelName: "Address" }
);

User.hasMany(Address, { foreignKey: "userId" });
Address.belongsTo(User, { foreignKey: "userId" });

export default Address;
