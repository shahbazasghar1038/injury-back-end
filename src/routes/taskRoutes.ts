// src/routes/taskRoutes.ts
import express from "express";
import {
  createTask,
  getTasksByCaseId,
  updateTaskStatus,
} from "../controllers/taskController";

const router = express.Router();

// Route to create a new task

router.post("/create", createTask);
// Route to get all tasks for a specific case
router.get("/:caseId", getTasksByCaseId);

// Route to update task status
router.put("/update-status/:id", updateTaskStatus);

export default router;
