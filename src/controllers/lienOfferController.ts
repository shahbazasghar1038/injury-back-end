import { Request, Response, NextFunction } from "express";
import LienOffer from "../models/LienOffer";
import Case from "../models/caseModel";
import User from "../models/userModel";

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
): Promise<void> {
  try {
    const lienOffers = await LienOffer.findAll({
      include: [
        {
          model: User, // Include User model
          attributes: ["id", "fullName", "email", "role"], // You can specify which attributes to fetch
        },
      ],
    });

    res.status(200).json({
      lienOffers,
    });
  } catch (error: any) {
    console.error("Error fetching lien offers:", error.message);
    next(error);
  }
}
