// src/controllers/archivedCaseController.ts
import { Request, Response, NextFunction } from "express";
import ArchivedCase from "../models/archivedCaseModel";
import Case from "../models/caseModel";

export async function archiveCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId, reason } = req.body;

  try {
    // Find the case by ID
    const caseInstance = await Case.findByPk(caseId);
    if (!caseInstance) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Create the archived case record
    const archivedCase = await ArchivedCase.create({
      caseId,
      archivedAt: new Date(),
      reason,
    });

    // Optionally, you can update the original case status to "Archived" if needed
    // caseInstance.status = "Archived";
    // await caseInstance.save();

    res
      .status(200)
      .json({ message: "Case successfully archived", archivedCase });
  } catch (error: any) {
    next(error);
  }
}

export async function unarchiveCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { archivedCaseId } = req.params; // Getting the archivedCaseId from the URL

  try {
    // Find the archived case by ID
    const archivedCase = await ArchivedCase.findByPk(archivedCaseId);
    if (!archivedCase) {
      return res.status(404).json({ error: "Archived case not found" });
    }

    // Optionally, if you need to restore or do something else with the case,
    // you can update or modify the case data here.

    // Mark the archived case as unarchived or delete it, depending on the logic needed
    // For example, we can change its status or move it back to the "active" state
    await ArchivedCase.destroy({ where: { id: archivedCaseId } }); // Delete the archived case

    // You can alternatively update the case status here if you want to unarchive it without deleting.
    // Example: archivedCase.status = 'Active'; await archivedCase.save();

    res.status(200).json({ message: "Archived case successfully unarchived" });
  } catch (error: any) {
    next(error); // Pass the error to the next middleware
  }
}

export async function getAllArchivedCases(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    // Fetch all archived cases
    const archivedCases = await ArchivedCase.findAll({
      include: [
        {
          model: Case, // Include the associated Case model data
          as: "case", // Use the alias defined in associations (optional)
        },
      ],
    });

    if (!archivedCases || archivedCases.length === 0) {
      return res.status(404).json({ message: "No archived cases found" });
    }

    // Send the response with the archived cases
    res.status(200).json(archivedCases);
  } catch (error: any) {
    console.error("Error fetching archived cases:", error.message);
    next(error); // Pass the error to the error handling middleware
  }
}
