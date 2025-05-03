import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust path if needed
import Case from "./caseModel";
import User from "./userModel";

class LienOffer extends Model {
  public id!: number;
  public offerAmount!: number;
  public message!: string;
  public caseId!: number; // Foreign key to Case
  public userId!: number; // The user who made the offer
  public createdAt!: Date;
  public updatedAt!: Date;
}

LienOffer.init(
  {
    offerAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    caseId: {
      type: DataTypes.INTEGER,
      references: {
        model: Case, // This is the reference to the Case model
        key: "id", // Foreign key points to the id in the Case model
      },
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Reference to the user who created the offer
    },
  },
  { sequelize, modelName: "LienOffer" }
);

// Define the relationship between Case and LienOffer (One Case has many Lien Offers)
Case.hasMany(LienOffer, { foreignKey: "caseId" });
LienOffer.belongsTo(Case, { foreignKey: "caseId" });

User.hasMany(LienOffer, { foreignKey: "userId" }); // Define that User can have many LienOffers
LienOffer.belongsTo(User, { foreignKey: "userId" });

export default LienOffer;
