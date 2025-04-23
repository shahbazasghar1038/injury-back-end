import express from "express";
import {
  createCase,
  getAllCases,
  updateCaseStatus,
} from "../controllers/caseController";

const router = express.Router();

// Route to create a new case
router.post("/create", createCase);

// Route to get all ongoing cases
router.get("/ongoing", getAllCases);

// Route to update case status
router.put("/:id/status", updateCaseStatus);

export default router;
