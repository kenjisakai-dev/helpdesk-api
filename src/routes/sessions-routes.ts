import { Router } from "express";
import { SessionsController } from "@/controllers/sessions-controllers";
import { SessionService } from "@/services/sessions-services";

const sessionsRoutes = Router();
const sessionService = new SessionService();
const sessionController = new SessionsController(sessionService);

sessionsRoutes.post("/", sessionController.create);

export { sessionsRoutes };
