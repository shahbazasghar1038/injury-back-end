// src/controllers/taskController.ts
import { Request, Response, NextFunction } from "express";
import Task from "../models/taskModel";
import Case from "../models/caseModel";
import { Sequelize } from "sequelize";
import { uploadFileToS3 } from "../utils/s3Uploader";

// Controller to create a new task and associate it with a case

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { taskTitle, status, description, caseId, fileBase64 } = req.body; // fileBase64 should come as a part of the request

  try {
    let fileUrl: string | null = null;

    // If file is uploaded in base64 format, upload it to S3
    if (fileBase64) {
      const buffer = Buffer.from(fileBase64, "base64"); // Convert base64 to buffer
      fileUrl = await uploadFileToS3(buffer, "inj-s3"); // Pass buffer to S3 upload function
    }

    // Create the task record with the URL of the file in the `files` field
    const task = await Task.create({
      taskTitle,
      status,
      description,
      files: fileUrl,
      caseId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error: any) {
    console.error("Error creating task:", error.message);
    next(error); // Pass the error to the error-handling middleware
  }
}

// Controller to get all tasks for a specific case
export async function getTasksByCaseId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { caseId } = req.params;

  try {
    // Find tasks by caseId
    const tasks = await Task.findAll({
      where: { caseId: caseId },
      include: [{ model: Case }], // Include case information if necessary
    });

    // Return the tasks associated with the case
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ error: error.message });
  }
}

// Controller to update task status
export async function updateTaskStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find the task by its ID
    const task = await Task.findByPk(id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Update task status
    task.status = status;
    await task.save();

    // Send updated task data
    res.status(200).json(task);
  } catch (error: any) {
    console.error("Error updating task status:", error.message);
    res.status(500).json({ error: error.message });
  }
}
