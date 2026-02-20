import { TaskController } from "@/controllers/tasks-controller";
import { TaskService } from "@/services/tasks-services";
import { Router } from "express";

const tasksRouter = Router();
const taskService = new TaskService();
const taskController = new TaskController(taskService);

tasksRouter.post("/", taskController.create);

export { tasksRouter };
