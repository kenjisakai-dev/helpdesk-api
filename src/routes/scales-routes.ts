import { Router } from "express";
import { verifyAuthorized } from "@/middlewares/verify-authorized";
import { ScaleService } from "@/services/scales-services";
import { ScaleController } from "@/controllers/scales-controllers";

const scalesRoutes = Router();
const scaleService = new ScaleService();
const scaleController = new ScaleController(scaleService);

scalesRoutes.get("/", scaleController.index);

scalesRoutes.post(
  "/user",
  verifyAuthorized(["admin"]),
  scaleController.createScaleUser,
);

scalesRoutes.get(
  "/user/:user_id",
  verifyAuthorized(["admin", "technical"]),
  scaleController.showScaleUsers,
);

export { scalesRoutes };
