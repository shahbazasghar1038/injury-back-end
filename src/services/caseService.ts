import { Sequelize, Op } from "sequelize"; // <-- Import Op here
import Case from "../models/caseModel";
import User from "../models/userModel";
import UserCases from "../models/userCasesModel"; // Import the junction model

const FREE_CASE_LIMIT = 3;

// Service to create a new case
export async function createCaseService(data: any, userId: number) {
  // Count user's existing cases
  const userCaseCount = await Case.count({
    include: [
      {
        model: User,
        where: { id: userId },
        through: { where: {} },
      },
    ],
  });

  // Check if user has exceeded free case limit
  if (userCaseCount >= FREE_CASE_LIMIT) {
    // If case is marked as paid, allow creation
    if (data.isPaidCase) {
      const newCase = await Case.create({
        ...data,
        paymentStatus: "Paid",
      });

      // Create association in junction table
      await UserCases.create({
        userId: userId,
        caseId: newCase.id,
      });

      return newCase;
    } else {
      throw new Error(
        `You have reached the free case limit (${FREE_CASE_LIMIT}). Please make a payment to add more cases.`
      );
    }
  }

  // If under free limit, create case
  const newCase = await Case.create({
    ...data,
    isPaidCase: false,
    paymentStatus: "Unpaid",
  });

  // Create association in junction table
  await UserCases.create({
    userId: userId,
    caseId: newCase.id,
  });

  return newCase;
}

// Service to count active cases for a user
export async function getActiveCaseCount(userId: number): Promise<number> {
  const activeCases = await Case.count({
    where: {
      status: {
        [Op.or]: ["Open", "In Progress"], // Use Op.or for filtering
      },
    },
    include: {
      model: User,
      where: { id: userId }, // Filter by user ID
    },
  });

  return activeCases;
}

// Service to get all ongoing cases
export async function getAllCasesService() {
  return await Case.findAll({
    where: { status: "In Progress" }, // Get cases with status 'In Progress'
  });
}

// Service to update case status
export async function updateCaseStatusService(id: number, status: string) {
  const caseToUpdate = await Case.findByPk(id);
  if (!caseToUpdate) throw new Error("Case not found");

  caseToUpdate.status = status;
  await caseToUpdate.save();

  return caseToUpdate;
}

// Service to get user's case count
export async function getUserCaseCount(userId: number): Promise<number> {
  return await Case.count({
    include: [
      {
        model: User,
        where: { id: userId },
        through: { where: {} },
      },
    ],
  });
}

// Service to check if user can add more free cases
export async function canAddFreeCase(userId: number): Promise<boolean> {
  const caseCount = await getUserCaseCount(userId);
  return caseCount < FREE_CASE_LIMIT;
}
