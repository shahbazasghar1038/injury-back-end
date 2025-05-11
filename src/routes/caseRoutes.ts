import express from "express";
import {
  createCase,
  getAllCases,
  updateCaseStatus,
  getCaseById,
  addDoctorToCase,
  deleteCase,
  updateCaseStatusOfLienOffer,
  getCaseByIdLien,
  updateCase,
  getCaseByIdLien2, // Add the handler for getting a case by ID
} from "../controllers/caseController";

const router = express.Router();

// Route to create a new case
router.post("/create", createCase);

// Route to get all ongoing cases
router.get("/allcases/:userId", getAllCases);

// Route to get a case by caseId
router.get("/:caseId", getCaseById); // New route for single case

router.get("/lienCase/:caseId", getCaseByIdLien); // New route for single case

router.get("/lienCase2/:caseId", getCaseByIdLien2); // New route for single case

router.delete("/:caseId", deleteCase); // New route for deleting a case
// Route to update case status
router.put("/:id/status", updateCaseStatus);

router.put("/update/:caseId", updateCase);

router.put("/LienOffer/:id", updateCaseStatusOfLienOffer); // New route for updating case status

router.post("/add-provider", addDoctorToCase);

export default router;
