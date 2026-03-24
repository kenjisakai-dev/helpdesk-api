import { Router } from "express";
import { ServicingController } from "@/controllers/servicings-controllers";
import { verifyAuthorized } from "@/middlewares/verify-authorized";
import { ServicingService } from "@/services/servicings-services";

const servicingRouter = Router();
const servicingService = new ServicingService();
const servicingController = new ServicingController(servicingService);

servicingRouter.get("/", servicingController.index);

servicingRouter.use(verifyAuthorized(["admin"]));

servicingRouter.post("/", servicingController.create);
servicingRouter.get("/:id", servicingController.show);
servicingRouter.patch("/", servicingController.update);

export { servicingRouter };
