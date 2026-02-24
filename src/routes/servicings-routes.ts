import { ServicingController } from "@/controllers/servicings-controllers";
import { ServicingService } from "@/services/servicings-services";
import { Router } from "express";

const servicingRouter = Router();
const servicingService = new ServicingService();
const servicingController = new ServicingController(servicingService);

servicingRouter.get("/", servicingController.index);

export { servicingRouter };
