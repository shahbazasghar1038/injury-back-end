import { Request, Response, NextFunction } from "express";
import { Sequelize, Op } from "sequelize";
import Case from "../models/caseModel";
import User from "../models/userModel";
import UserCases from "../models/userCasesModel"; // Junction table
import EmailService from "../utils/emailService";
import ArchivedCase from "../models/archivedCaseModel";
import Task from "../models/taskModel";
import ProviderTreatmentRecord from "../models/providerTreatmentRecord";

// Controller to create a new case and check if the user has exceeded free case limit
export async function createCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseData, userId } = req.body;

  try {
    // Fetch the user's current case count and case limit
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has exceeded their case limit
    if (user.usercaseCount >= user.usercaseLimit) {
      return res.status(403).json({
        error: `You have reached the maximum limit of ${user.usercaseLimit} cases. Please upgrade your plan or make a payment to add more cases.`,
      });
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

    // Increment the user's case count
    user.usercaseCount += 1;
    await user.save();

    // Send the response with case data
    res.status(201).json({ case: newCase });
  } catch (error: any) {
    console.error("Error creating case:", error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function updateCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId } = req.params; // Get the caseId from the request parameters
  const updates = req.body; // Get the fields to update from the request body

  try {
    // Find the case by its ID
    const caseToUpdate: any = await Case.findByPk(caseId);
    if (!caseToUpdate) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Dynamically update fields based on what is passed in the request body
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        caseToUpdate[key] = updates[key]; // Update the field dynamically
      }
    });

    // Save the updated case data
    await caseToUpdate.save();

    // Send the updated case data in the response
    res.status(200).json({
      message: "Case updated successfully",
      updatedCase: caseToUpdate,
    });
  } catch (error: any) {
    // Catch and handle any errors
    console.error("Error updating case:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Controller to get all cases with associated provider treatment records based on userId
export async function getAllCases(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  try {
    // Get a list of archived case IDs from the ArchivedCase table
    const archivedCaseIds = await ArchivedCase.findAll({
      attributes: ["caseId"], // Only retrieve the caseId field
    });

    const archivedCaseIdsList = archivedCaseIds.map(
      (archivedCase) => archivedCase.caseId
    );

    // Fetch cases based on the userId and exclude the archived cases
    const cases = await Case.findAll({
      where: {
        id: {
          [Op.notIn]: archivedCaseIdsList, // Exclude archived case IDs
        },
      },
      include: [
        {
          model: User, // Assuming you have a relationship set up between Case and User
          where: { id: userId }, // Filter by userId
        },
      ],
    });

    // If no cases found
    if (!cases || cases.length === 0) {
      return res.status(404).json({ message: "No cases found for this user" });
    }

    // Now we fetch the provider treatment records based on caseId and userId
    const providerTreatmentRecords = await ProviderTreatmentRecord.findAll({
      where: {
        userId: userId, // Filter by userId
        caseId: {
          [Op.in]: cases.map((caseInstance: any) => caseInstance.id), // Get treatment records for the cases
        },
      },
    });

    // Create separate arrays for cases and treatment records
    const casesData = cases.map((caseInstance: any) => caseInstance.toJSON());
    const treatmentRecordsData = providerTreatmentRecords.map((record: any) =>
      record.toJSON()
    );

    // Send the response with the cases and treatment records in separate arrays
    res.status(200).json({
      cases: casesData,
      treatmentRecords: treatmentRecordsData,
    });
  } catch (error: any) {
    console.error("Error fetching cases:", error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function getCaseByIdLien(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId } = req.params; // Get the caseId from the request parameters

  try {
    // Find the case by the given caseId and include the associated doctors (users with the role 'Doctor')
    const caseInstance: any = await Case.findByPk(caseId, {
      include: [
        {
          model: User,
          where: { role: "Doctor" }, // Filter users by "Doctor" role
          required: false, // Allow users not to be attached, to still get the case
          // as: "doctors", // Alias for doctors
        },
      ],
    });

    // Check if the case exists
    if (!caseInstance) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Fetch the provider treatment records for the doctors associated with the case
    const providerTreatmentRecords = await ProviderTreatmentRecord.findAll({
      where: { caseId: caseInstance.id },
      include: [
        {
          model: User,
          as: "user", // Alias for accessing user (doctor) details
        },
      ],
    });

    // Send the case data, associated doctors, and provider treatment records in the response
    return res.status(200).json({
      case: caseInstance,
      doctors: caseInstance.doctors, // Doctors associated with the case
      providerTreatmentRecords: providerTreatmentRecords, // Fetching provider treatment records based on caseId
    });
  } catch (error: any) {
    // Handle any error that might occur and pass it to the error handling middleware
    next(error);
  }
}



export async function getCaseByIdLien2(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId } = req.params;

  try {
    const caseInstance: any = await Case.findByPk(caseId, {
      include: [
        {
          model: User,
          where: { role: "Attorney" },
          required: false,
        },
      ],
    });

    if (!caseInstance) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Convert case to plain object
    const caseObj = caseInstance.toJSON();

    // Fetch all treatment records for this case
    const providerTreatmentRecords = await ProviderTreatmentRecord.findAll({
      where: { caseId: caseInstance.id },
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    // Convert all treatment records to plain objects

    // Prepare doctors array with their single treatment record (object or null)

    return res.status(200).json({
      case: {
        ...caseObj,
        providerTreatmentRecords,
      },
    });
  } catch (error: any) {
    next(error);
  }
}
export async function getCaseById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId } = req.params;

  try {
    // Find the case by the given caseId
    const caseInstance: any = await Case.findByPk(caseId, {
      include: [
        {
          model: User,
          where: { role: "Doctor" }, // Filter users by "Doctor" role
          required: false, // Allow users not to be attached, to still get the case
        },
      ],
    });

    // Check if the case exists
    if (!caseInstance) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Send the case data and the associated doctors in the response
    return res.status(200).json({
      case: caseInstance,
      doctors: caseInstance.Users, // This will return the associated doctors (users)
    });
  } catch (error: any) {
    console.error("Error fetching case by ID:", error.message);
    next(error); // Pass the error to the error handling middleware
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

export async function updateCaseStatusOfLienOffer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const { status, DoctorAcceptanceStatus, startDate, billAmount } = req.body;

  try {
    // Find the case by its ID
    const caseToUpdate = await Case.findByPk(id);

    if (!caseToUpdate) {
      throw new Error("Case not found");
    }

    // Update case status, billAmount, startDate, and DoctorAcceptanceStatus
    if (status) caseToUpdate.status = status;
    if (DoctorAcceptanceStatus)
      caseToUpdate.DoctorAcceptanceStatus = DoctorAcceptanceStatus;
    if (startDate) caseToUpdate.startDate = startDate;
    if (billAmount !== undefined) caseToUpdate.billAmount = billAmount;

    // Save the updated case data
    await caseToUpdate.save();

    // Send the updated case data in the response
    res.status(200).json({
      message: "Case updated successfully",
      updatedCase: caseToUpdate,
    });
  } catch (error: any) {
    console.error("Error updating case status:", error.message);
    res.status(500).json({ error: error.message });
  }
}

export async function deleteCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId } = req.params; // Get the caseId from the request parameters

  try {
    // Find the case by its ID
    const caseInstance = await Case.findByPk(caseId);
    if (!caseInstance) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Check if the case is archived
    const archivedCase = await ArchivedCase.findOne({ where: { caseId } });
    if (archivedCase) {
      // If the case is archived, delete the archived case first
      await ArchivedCase.destroy({ where: { caseId } });
    }

    // Delete all associated tasks
    await Task.destroy({ where: { caseId } });

    // Now delete the case
    await Case.destroy({ where: { id: caseId } });

    // Send a success response
    res.status(200).json({
      message:
        "Case and its associated tasks and archived record successfully deleted",
    });
  } catch (error: any) {
    next(error); // Pass the error to the error-handling middleware
  }
}

export async function addDoctorToCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId, doctorIds } = req.body; // caseId and an array of doctorIds

  try {
    // Ensure that the caseId and doctorIds are provided
    if (!caseId || !Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({ error: "Invalid caseId or doctorIds" });
    }

    // Find the case by its ID
    const caseInstance = await Case.findByPk(caseId);
    if (!caseInstance) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Find all the doctors by their IDs (users with role "Doctor")
    const doctors = await User.findAll({
      where: {
        id: doctorIds,
        role: "Doctor", // Ensure that the users are doctors
      },
    });

    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ error: "No doctors found with the provided IDs" });
    }

    // Check if any doctor is already assigned to the case
    const existingAssociations = await UserCases.findAll({
      where: {
        caseId: caseInstance.id,
        userId: doctorIds,
      },
    });

    if (existingAssociations.length > 0) {
      return res.status(400).json({
        error: "One or more doctors are already assigned to this case",
      });
    }

    // Create associations between the doctors and the case
    const userCases = doctors.map((doctor) => {
      return UserCases.create({
        userId: doctor.id,
        caseId: caseInstance.id,
      }).catch((err) => {
        // Return error object if doctor add fails
        return {
          error: `Failed to add doctor ${doctor.fullName}: ${err.message}`,
        };
      });
    });

    // Wait for all associations to be created
    const results = await Promise.all(userCases);

    // Filter out any failed cases and handle them
    const failedResults = results.filter(
      (result: any) => result && result.error
    );
    if (failedResults.length > 0) {
      return res.status(500).json({
        message: "Some doctors were not added successfully",
        failedResults,
      });
    }

    // Create the provider treatment records for the doctors
    const providerTreatmentRecords = doctors.map((doctor) => {
      return ProviderTreatmentRecord.create({
        caseId: caseInstance.id,
        userId: doctor.id,
        treatmentStatus: "Pending", // Default value for treatmentStatus
        bill: "", // Default empty bill string
        recordRequest: "Pending", // Default value for recordRequest
      }).catch((err) => {
        // Return error object if provider treatment record creation fails
        return {
          error: `Failed to create provider treatment record for doctor ${doctor.fullName}: ${err.message}`,
        };
      });
    });

    // Wait for all treatment records to be created
    const recordResults = await Promise.all(providerTreatmentRecords);

    // Filter out any failed records and handle them
    const failedRecords = recordResults.filter(
      (result: any) => result && result.error
    );
    if (failedRecords.length > 0) {
      return res.status(500).json({
        message: "Some treatment records were not created successfully",
        failedRecords,
      });
    }

    // Send email notifications to each doctor
    const subjectLine = "You have been added to a case as a doctor";
    const contentBody = `<p>Dear Doctor,</p>
                         <p>You have been added as a provider for the following case:</p>
                         <p>Case ID: ${caseInstance.id}</p>
                         <p>Case Name: ${caseInstance.fullName}</p>
                         <p>Case Status: ${caseInstance.status}</p>
                         <p>Thank you for your support.</p>`;

    // Send the email to each doctor
    const emailResults = await Promise.all(
      doctors.map((doctor) =>
        EmailService.send(doctor.email, { subjectLine, contentBody }).catch(
          (err) => {
            return {
              error: `Failed to send email to ${doctor.email}: ${err.message}`,
            };
          }
        )
      )
    );

    // Filter out any failed email sends and handle them
    const failedEmails = emailResults.filter(
      (result: any) => result && result.error
    );
    if (failedEmails.length > 0) {
      return res.status(500).json({
        message: "Some emails were not sent successfully",
        failedEmails,
      });
    }

    // Send a success response
    res.status(200).json({
      message: `${doctors.length} doctors successfully added to the case`,
      doctors,
    });
  } catch (error: any) {
    // Catch any other unhandled errors
    console.error("Error in addDoctorToCase:", error.message);
    next(error); // Pass the error to the error handling middleware
  }
}
