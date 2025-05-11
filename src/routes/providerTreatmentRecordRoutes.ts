import { Router } from "express";
import {
  createProviderTreatmentRecord,
  updateProviderTreatmentRecord,
  deleteProviderTreatmentRecord,
} from "../controllers/providerTreatmentRecordController"; // Import controller functions

const router = Router();

// Route to create a new provider treatment record
router.post("/create", createProviderTreatmentRecord);

// Route to update an existing provider treatment record
router.put("/update/:id", updateProviderTreatmentRecord);

// Route to delete a provider treatment record
router.delete("/delete/:id", deleteProviderTreatmentRecord);

export default router;
