// src/controllers/intakeController.ts
import { Request, Response, NextFunction } from "express";
import Intake from "../models/intakeModel";
import multer from "multer";
import { uploadFileToS3 } from "../utils/s3Uploader";

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Store in memory for S3 upload
const upload = multer({ storage });

export async function createIntakeCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const {
    fullName,
    dateOfBirth,
    phoneNumber,
    accidentLocation,
    accidentDescription,
    injuries,
    weatherConditions,
    defendantInsuranceBase64, // Assuming the base64 file is sent under this name
  } = req.body;

  try {
    let defendantInsuranceUrl: string | null = null;

    // If defendant insurance file is provided as base64, upload it to S3
    if (defendantInsuranceBase64) {
      const buffer = Buffer.from(defendantInsuranceBase64, "base64");
      defendantInsuranceUrl = await uploadFileToS3(buffer, "inj-s3");
    }

    // Create the intake case record
    const intakeCase = await Intake.create({
      fullName,
      dateOfBirth,
      phoneNumber,
      defendantInsurance: defendantInsuranceUrl,
      accidentLocation,
      accidentDescription,
      injuries,
      weatherConditions,
    });

    res.status(201).json({
      message: "Intake case created successfully",
      intakeCase,
    });
  } catch (error: any) {
    console.error("Error creating intake case:", error.message);
    next(error);
  }
}
export async function getAllIntakeCases(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Fetch all intake cases from the database
    const intakeCases = await Intake.findAll();

    // Send the response with all intake cases
    res.status(200).json({
      message: "All intake cases fetched successfully",
      intakeCases,
    });
  } catch (error: any) {
    console.error("Error fetching intake cases:", error.message);
    next(error); // Pass the error to the error-handling middleware
  }
}
