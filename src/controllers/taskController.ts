// src/controllers/taskController.ts
import { Request, Response, NextFunction } from "express";
import Task from "../models/taskModel";
import Case from "../models/caseModel";
import { Sequelize } from "sequelize";

// Controller to create a new task and associate it with a case
export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { taskData, caseId } = req.body;

  try {
    // Check if the case exists
    const caseInstance = await Case.findByPk(caseId);
    if (!caseInstance) {
      throw new Error("Case not found");
    }

    // Create the task and associate it with the case
    const task = await Task.create({
      ...taskData,
      caseId, // Foreign key association
    });

    // Send the response with task data
    res.status(201).json({ task });
  } catch (error: any) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ error: error.message }); // Return the error message to the client
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
