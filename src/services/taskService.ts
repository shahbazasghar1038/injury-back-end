// src/services/taskService.ts
import Task from "../models/taskModel";
import Case from "../models/caseModel";

// Service to create a new task and associate it with a case
export async function createTaskService(taskData: any, caseId: number) {
  // Validate if the case exists
  const caseInstance = await Case.findByPk(caseId);
  if (!caseInstance) {
    throw new Error("Case not found");
  }

  // Create the task and associate it with the case
  const task = await Task.create({
    ...taskData,
    caseId, // Foreign key association
  });

  return task;
}

// Service to get all tasks for a specific case
export async function getAllTasksService(caseId: number) {
  return await Task.findAll({
    where: { caseId },
    include: [{ model: Case }],
  });
}

// Service to update task status
export async function updateTaskStatusService(id: number, status: string) {
  const task = await Task.findByPk(id);
  if (!task) {
    throw new Error("Task not found");
  }

  task.status = status;
  await task.save();

  return task;
}
