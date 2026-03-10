import { Router } from "express";
import { UserController } from "@/controllers/users-controllers";
import { UserService } from "@/services/users-services";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyAuthorized } from "@/middlewares/verify-authorized";

const usersRoutes = Router();
const userService = new UserService();
const userController = new UserController(userService);

usersRoutes.post("/", userController.create);

usersRoutes.use(ensureAuthenticated);

usersRoutes.patch("/", userController.update);
usersRoutes.patch("/changePassword", userController.changePassword);
usersRoutes.delete("/", userController.delete);

usersRoutes.get(
  "/technicals",
  verifyAuthorized(["admin"]),
  userController.indexTechnicals,
);

export { usersRoutes };
