import { Request, Response, NextFunction } from "express";
import { Sequelize, Op } from "sequelize";
import Case from "../models/caseModel";
import User from "../models/userModel";
import UserCases from "../models/userCasesModel"; // Junction table
import EmailService from "../utils/emailService";

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

export async function getCaseById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId } = req.params;

  try {
    // Find the case by the given caseId
    const caseInstance = await Case.findByPk(caseId); // Find case by primary key (ID)

    if (!caseInstance) {
      // If no case is found with the given caseId, send a 404 response
      return res.status(404).json({ error: "Case not found" });
    }

    // Send the case data in the response
    return res.status(200).json(caseInstance);
  } catch (error: any) {
    next(error); // Handle the error via middleware
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
export async function addDoctorToCase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { caseId, doctorIds } = req.body; // caseId and an array of doctorIds

  try {
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

    // Create associations between the doctors and the case
    const userCases = doctors.map((doctor) => {
      return UserCases.create({
        userId: doctor.id,
        caseId: caseInstance.id,
      });
    });

    // Wait for all associations to be created
    await Promise.all(userCases);

    // Send email notifications to each doctor
    const subjectLine = "You have been added to a case as a doctor";
    const contentBody = `<p>Dear Doctor,</p>
                         <p>You have been added as a provider for the following case:</p>
                         <p>Case ID: ${caseInstance.id}</p>
                         <p>Case Name: ${caseInstance.fullName}</p>
                         <p>Case Status: ${caseInstance.status}</p>
                         <p>Thank you for your support.</p>`;

    // Send the email to each doctor
    await Promise.all(
      doctors.map((doctor) =>
        EmailService.send(doctor.email, { subjectLine, contentBody })
      )
    );

    // Send a success response
    res.status(200).json({
      message: `${doctors.length} doctors successfully added to the case`,
      doctors,
    });
  } catch (error: any) {
    next(error); // Pass the error to the error handling middleware
  }
}
