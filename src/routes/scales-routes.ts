import { Router } from "express";
import { ScaleService } from "@/services/scales-services";
import { ScaleController } from "@/controllers/scales-controllers";

const scalesRoutes = Router();
const scaleService = new ScaleService();
const scaleController = new ScaleController(scaleService);

scalesRoutes.get("/", scaleController.index);

export { scalesRoutes };
