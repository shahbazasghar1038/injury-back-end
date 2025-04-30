// src/routes/intakeRoutes.ts
import { Router } from "express";
import {
  createIntakeCase,
  getAllIntakeCases,
} from "../controllers/intakeController";

const router = Router();

// Route to create a new intake case
router.post("/create", createIntakeCase);
router.get("/all", getAllIntakeCases);

export default router;
