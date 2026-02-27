import { Router } from "express";
import { UserController } from "@/controllers/users-controllers";
import { UserService } from "@/services/users-services";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const usersRoutes = Router();
const userService = new UserService();
const userController = new UserController(userService);

usersRoutes.post("/", userController.create);
usersRoutes.patch("/", ensureAuthenticated, userController.delete);

export { usersRoutes };
