// src/routes/intakeRoutes.ts
import { Router } from "express";
import {
  createIntakeCase,
  getAllIntakeCases,
} from "../controllers/intakeController";
import { upload } from "../utils/s3Uploader";

const router = Router();

// Route to create a new intake case
router.post(
  "/create",
  upload.fields([{ name: "defendantInsurance", maxCount: 1 }]),
  createIntakeCase
);
router.get("/all", getAllIntakeCases);

export default router;
