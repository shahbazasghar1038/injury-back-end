import User from "./userModel";
import Case from "./caseModel";
import UserCases from "./userCasesModel";

export const setupAssociations = () => {
  // User and Case many-to-many relationship
  User.belongsToMany(Case, {
    through: UserCases,
    foreignKey: "userId",
    otherKey: "caseId",
  });

  Case.belongsToMany(User, {
    through: UserCases,
    foreignKey: "caseId",
    otherKey: "userId",
  });
};
