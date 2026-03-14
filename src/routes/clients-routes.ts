import { Router } from "express";
import { ClientService } from "@/services/clients-services";
import { ClientController } from "@/controllers/clients-controllers";
import { verifyAuthorized } from "@/middlewares/verify-authorized";

const clientsRoutes = Router();
const clientService = new ClientService();
const clientController = new ClientController(clientService);

clientsRoutes.use(verifyAuthorized(["admin"]));

clientsRoutes.patch("/", clientController.update);
clientsRoutes.get("/", clientController.index);
clientsRoutes.get("/:id", clientController.show);
clientsRoutes.delete("/:id", clientController.delete);

export { clientsRoutes };
