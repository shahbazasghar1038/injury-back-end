import { Request, Response, NextFunction } from "express";
import ProviderTreatmentRecord from "../models/providerTreatmentRecord"; // Import the model

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
  const { treatmentStatus, bill, recordRequest } = req.body;

  try {
    // Find the provider treatment record by ID
    const recordToUpdate = await ProviderTreatmentRecord.findByPk(id);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ error: "Provider treatment record not found" });
    }

    // Update the fields dynamically based on request body
    if (treatmentStatus) recordToUpdate.treatmentStatus = treatmentStatus;
    if (bill !== undefined) recordToUpdate.bill = bill;
    if (recordRequest) recordToUpdate.recordRequest = recordRequest;

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
