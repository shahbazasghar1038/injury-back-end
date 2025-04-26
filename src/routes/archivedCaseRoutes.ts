// src/routes/archivedCaseRoutes.ts
import { Router } from "express";
import {
  archiveCase,
  getAllArchivedCases,
  unarchiveCase,
} from "../controllers/archivedCaseController";

const router = Router();

// Route to archive a case
router.post("/archived", archiveCase);

router.delete("/unarchive/:archivedCaseId", unarchiveCase);

router.get("/", getAllArchivedCases);

export default router;
