import { Router } from "express";
import { ScaleService } from "@/services/scales-services";
import { ScaleController } from "@/controllers/scales-controllers";
import { verifyAuthorized } from "@/middlewares/verify-authorized";

const scalesRoutes = Router();
const scaleService = new ScaleService();
const scaleController = new ScaleController(scaleService);

scalesRoutes.get("/", verifyAuthorized(["admin"]), scaleController.index);

export { scalesRoutes };
