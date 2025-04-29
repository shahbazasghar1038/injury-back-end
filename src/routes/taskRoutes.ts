// src/routes/taskRoutes.ts
import express from "express";
import {
  createTask,
  getTasksByCaseId,
  updateTaskStatus,
} from "../controllers/taskController";
import { upload } from "../utils/s3Uploader";

const router = express.Router();

// Route to create a new task

router.post("/create", upload.single("file"), createTask);
// Route to get all tasks for a specific case
router.get("/:caseId", getTasksByCaseId);

// Route to update task status
router.put("/update-status/:id", updateTaskStatus);

export default router;
