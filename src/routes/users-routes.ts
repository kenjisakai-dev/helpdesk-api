import { Router } from "express";
import { UserController } from "@/controllers/users-controllers";
import { UserService } from "@/services/users-services";

const usersRoutes = Router();
const userService = new UserService();
const userController = new UserController(userService);

usersRoutes.post("/", userController.create);

export { usersRoutes };
