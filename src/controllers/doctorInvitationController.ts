// src/controllers/doctorInvitationController.ts
import { Request, Response, NextFunction } from "express";
import DoctorInvitation from "../models/doctorInvitationModel";
import EmailService from "../utils/emailService"; // Assuming you have an email service for sending emails

export async function inviteDoctor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { fullName, email, phone, speciality, caseId } = req.body;

  try {
    // Create a new doctor invitation
    const invitation = await DoctorInvitation.create({
      fullName,
      email,
      phone,
      speciality,
      caseId,
      status: "Pending", // Initially, the status is Pending
      role: "Doctor", // Fixed role as Doctor
    });

    // Send the invitation email with a signup link
    const subjectLine = "You're invited to join a case";
    const contentBody = `<p>You have been invited to join a case. Please complete your registration by clicking the link below:</p>
    <p><a href="http://localhost:5173/invite/doctor/${invitation.id}">Complete your registration</a></p>`;

    await EmailService.send(email, { subjectLine, contentBody });

    res.status(201).json({ message: "Invitation sent successfully" });
  } catch (error: any) {
    console.error("Error sending invitation:", error);
    next(error);
  }
}
export async function getDoctorInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { invitationId } = req.params;

  try {
    // Find the doctor invitation by the invitationId
    const invitation = await DoctorInvitation.findByPk(invitationId);

    if (!invitation || invitation.status !== "Pending") {
      return res.status(404).json({ error: "Invalid or expired invitation" });
    }

    // Send the invitation data (without creating the doctor)
    res.status(200).json({
      message: "Invitation details retrieved successfully",
      invitation,
    });
  } catch (error: any) {
    console.error("Error fetching invitation data:", error);
    next(error); // Pass the error to the error handling middleware
  }
}
