import { Request, Response, NextFunction } from "express";
import { Sequelize, Op } from "sequelize";
import Case from "../models/caseModel";
import User from "../models/userModel";
import UserCases from "../models/userCasesModel"; // Junction table

const FREE_CASE_LIMIT = 3;

// Controller to create a new case and check if the user has exceeded free case limit
export async function createCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { caseData, userId } = req.body;

  try {
    // Check if user can add more free cases
    const userCaseCount = await Case.count({
      include: [
        {
          model: User,
          where: { id: userId },
          through: { where: {} },
        },
      ],
    });

    const canAddFree = userCaseCount < FREE_CASE_LIMIT;

    // If user has exceeded free limit and case is not marked as paid
    if (!canAddFree && !caseData.isPaidCase) {
      res.status(403).json({
        error:
          "You have reached the free case limit. Please make a payment to add more cases.",
      });
      return;
    }

    // Create the case in the database with userId
    const newCase = await Case.create({
      ...caseData,
      paymentStatus: caseData.isPaidCase ? "Paid" : "Unpaid",
    });

    // Associate the case with the user in the junction table
    await UserCases.create({
      userId: userId,
      caseId: newCase.id,
    });

    // Send the response with case data
    res.status(201).json({ case: newCase });
  } catch (error: any) {
    console.error("Error creating case:", error.message);
    res.status(500).json({ error: error.message }); // Return the error message to the client
  }
}

// Controller to get all ongoing cases
// export async function getAllCases(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> {
//   try {
//     const cases = await Case.findAll();

//     res.status(200).json(cases);
//   } catch (error: any) {
//     console.error("Error fetching cases:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// }

export async function getAllCases(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  try {
    // Fetch cases based on the userId
    const cases = await Case.findAll({
      include: [
        {
          model: User, // Assuming you have a relationship set up between Case and User
          where: { id: userId }, // Filter by userId
        },
      ],
    });

    // Send the response with the cases
    res.status(200).json(cases);
  } catch (error: any) {
    console.error("Error fetching cases:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Controller to update case status
export async function updateCaseStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const caseToUpdate = await Case.findByPk(id);

    if (!caseToUpdate) {
      throw new Error("Case not found");
    }

    // Update case status
    caseToUpdate.status = status;
    await caseToUpdate.save();

    // Send the updated case data
    res.status(200).json(caseToUpdate);
  } catch (error: any) {
    console.error("Error updating case status:", error.message);
    res.status(500).json({ error: error.message });
  }
}
