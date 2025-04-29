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
  } = req.body;
  const files: any = req.files; // Assuming the files are uploaded via form-data

  try {
    let defendantInsuranceUrl: any = null;

    // If a defendant insurance file is uploaded, upload it to S3
    if (files && files.defendantInsurance) {
      defendantInsuranceUrl = await uploadFileToS3(
        files.defendantInsurance[0],
        "inj-s3"
      );
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
