import { Request, Response, NextFunction } from "express";
import ProviderTreatmentRecord from "../models/providerTreatmentRecord"; // Import the model
import { uploadFileToS3 } from "../utils/s3Uploader";

// Controller to create a new provider treatment record
export async function createProviderTreatmentRecord(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { caseId, userId, treatmentStatus, bill, recordRequest } = req.body;

  try {
    // Create the provider treatment record
    const newRecord = await ProviderTreatmentRecord.create({
      caseId,
      userId,
      treatmentStatus: treatmentStatus || "Pending", // Default value
      bill: bill || "",
      recordRequest: recordRequest || "Pending", // Default value
    });

    // Send the response with the new provider treatment record
    res.status(201).json({
      message: "Provider treatment record created successfully",
      newRecord,
    });
  } catch (error: any) {
    console.error("Error creating provider treatment record:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Controller to update a provider treatment record
export async function updateProviderTreatmentRecord(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { id } = req.params; // Get the record ID from the request params
  const {
    treatmentStatus,
    bill,
    recordRequest,
    doctorAcceptanceStatus,
    reducedAmount,
    BillRequest,
    medicalRecord,
    medicalBills,
  } = req.body;

  try {
    // Find the provider treatment record by ID
    const recordToUpdate = await ProviderTreatmentRecord.findByPk(id);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ error: "Provider treatment record not found" });
    }

    // Update the fields dynamically based on the request body
    if (treatmentStatus) recordToUpdate.treatmentStatus = treatmentStatus;
    if (bill !== undefined) recordToUpdate.bill = bill;
    if (recordRequest) recordToUpdate.recordRequest = recordRequest;
    if (doctorAcceptanceStatus)
      recordToUpdate.doctorAcceptanceStatus = doctorAcceptanceStatus;
    if (reducedAmount) recordToUpdate.reducedAmount = reducedAmount;
    if (BillRequest) recordToUpdate.BillRequest = BillRequest;

    // Handle file uploads for medical record (multiple files)
    if (medicalRecord && Array.isArray(medicalRecord)) {
      // Upload each file in the medicalRecord array
      const medicalRecordUrls = await Promise.all(
        medicalRecord.map((file: string) => {
          const buffer = Buffer.from(file, "base64"); // Convert base64 string to buffer
          return uploadFileToS3(buffer, "inj-s3"); // Upload file to S3
        })
      );
      recordToUpdate.medicalRecord = medicalRecordUrls.join(","); // Store multiple URLs as a comma-separated string
    }

    // Handle file uploads for medical bills (multiple files)
    if (medicalBills && Array.isArray(medicalBills)) {
      const medicalBillsUrls = await Promise.all(
        medicalBills.map((file: string) => {
          const buffer = Buffer.from(file, "base64"); // Convert base64 string to buffer
          return uploadFileToS3(buffer, "inj-s3"); // Upload file to S3
        })
      );
      recordToUpdate.medicalBills = medicalBillsUrls.join(","); // Store multiple URLs as a comma-separated string
    }

    // Save the updated record
    await recordToUpdate.save();

    // Send the updated record in the response
    res.status(200).json({
      message: "Provider treatment record updated successfully",
      updatedRecord: recordToUpdate,
    });
  } catch (error: any) {
    console.error("Error updating provider treatment record:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Controller to delete a provider treatment record
export async function deleteProviderTreatmentRecord(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { id } = req.params; // Get the record ID from the request params

  try {
    // Find the provider treatment record by ID
    const recordToDelete = await ProviderTreatmentRecord.findByPk(id);
    if (!recordToDelete) {
      return res
        .status(404)
        .json({ error: "Provider treatment record not found" });
    }

    // Delete the record
    await recordToDelete.destroy();

    // Send a success response
    res.status(200).json({
      message: "Provider treatment record deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting provider treatment record:", error.message);
    res.status(500).json({ error: error.message });
  }
}
