import { Request, Response, NextFunction } from "express";
import {
  createCaseService,
  getActiveCaseCount,
  getAllCasesService,
  updateCaseStatusService,
  canAddFreeCase,
} from "../services/caseService";
import Case from "../models/caseModel";
import User from "../models/userModel";

// Controller to create a new case and check if the user has exceeded free case limit
export async function createCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { caseData, userId } = req.body;

  try {
    // Check if user can add more free cases
    const canAddFree = await canAddFreeCase(userId);

    // If user has exceeded free limit and case is not marked as paid
    if (!canAddFree && !caseData.isPaidCase) {
      res.status(403).json({
        error:
          "You have reached the free case limit. Please make a payment to add more cases.",
      });
      return;
    }

    // Create the case in the database with userId
    const caseInstance = await createCaseService(caseData, userId);

    // Send the response with case data
    res.status(201).json({ case: caseInstance });
  } catch (error) {
    next(error);
  }
}

// Controller to get all ongoing cases
export async function getAllCases(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cases = await getAllCasesService();
    res.status(200).json(cases);
  } catch (error) {
    next(error);
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
    const updatedCase = await updateCaseStatusService(Number(id), status);
    res.status(200).json(updatedCase);
  } catch (error) {
    next(error);
  }
}
