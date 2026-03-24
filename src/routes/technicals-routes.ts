import { Router } from "express";
import { TechnicalService } from "@/services/technicals-services";
import { TechnicalController } from "@/controllers/technicals-controllers";
import { verifyAuthorized } from "@/middlewares/verify-authorized";
import { verifyTechnicalOwner } from "@/middlewares/verify-technical-owner";

const technicalsRoutes = Router();
const technicalService = new TechnicalService();
const technicalController = new TechnicalController(technicalService);

technicalsRoutes.use(verifyAuthorized(["admin", "technical"]));
technicalsRoutes.get("/:id", verifyTechnicalOwner, technicalController.show);

technicalsRoutes.use(verifyAuthorized(["admin"]));
technicalsRoutes.post("/", technicalController.create);
technicalsRoutes.patch("/", technicalController.update);
technicalsRoutes.get("/", technicalController.index);

export { technicalsRoutes };
