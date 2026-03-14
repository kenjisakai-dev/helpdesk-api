import { Router } from "express";
import { TechnicalService } from "@/services/technicals-services";
import { TechnicalController } from "@/controllers/technicals-controllers";
import { verifyAuthorized } from "@/middlewares/verify-authorized";

const technicalsRoutes = Router();
const technicalService = new TechnicalService();
const technicalController = new TechnicalController(technicalService);

technicalsRoutes.use(verifyAuthorized(["admin"]));

technicalsRoutes.post("/", technicalController.create);
technicalsRoutes.patch("/", technicalController.update);
technicalsRoutes.get("/", technicalController.index);
technicalsRoutes.get("/:id", technicalController.show);

export { technicalsRoutes };
