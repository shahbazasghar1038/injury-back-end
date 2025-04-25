// src/routes/doctorInvitationRoutes.ts
import express from "express";
import {
  inviteDoctor,
  getDoctorInvitation,
} from "../controllers/doctorInvitationController";

const router = express.Router();

// Route to invite a doctor
router.post("/doctor", inviteDoctor);

// Route to handle doctor clicking the invitation link
router.get("/doctor/:invitationId", getDoctorInvitation);

export default router;
