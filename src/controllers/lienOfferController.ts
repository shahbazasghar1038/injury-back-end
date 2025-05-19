import { Request, Response, NextFunction } from "express";
import LienOffer from "../models/LienOffer";
import Case from "../models/caseModel";
import User from "../models/userModel";
import { Op } from "sequelize";

export async function createLienOffer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { offerAmount, message, caseId, userId } = req.body;

  try {
    // Check if the case exists
    const caseRecord = await Case.findByPk(caseId);
    if (!caseRecord) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Create the lien offer record
    const lienOffer = await LienOffer.create({
      offerAmount,
      message,
      caseId,
      userId,
    });

    res.status(201).json({
      message: "Lien offer created successfully",
      lienOffer,
    });
  } catch (error: any) {
    console.error("Error creating lien offer:", error.message);
    next(error);
  }
}

export async function getAllLienOffers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId } = req.query; // Get the caseId from the query parametersssssssrrrrrrrrrrrrrrrrrrrrrrrr

  try {
    // If caseId is provided, filter by caseId
    const lienOffers = await LienOffer.findAll({
      where: {
        caseId, // Filter by caseId
      },
      include: [
        {
          model: User, // Include User model
          attributes: ["id", "fullName", "email", "role"], // You can specify which attributes to fetch
        },
      ],
    });

    if (!lienOffers || lienOffers.length === 0) {
      return res
        .status(404)
        .json({ message: "No lien offers found for this case" });
    }

    // Send the response with lien offers
    res.status(200).json({
      lienOffers,
    });
  } catch (error: any) {
    console.error("Error fetching lien offers:", error.message);
    next(error); // Pass the error to the error handling middleware
  }
}
