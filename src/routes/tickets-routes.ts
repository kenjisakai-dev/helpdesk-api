import { Router } from "express";
import { TicketController } from "@/controllers/tickets-controller";
import { verifyAuthorized } from "@/middlewares/verify-authorized";
import { TicketService } from "@/services/tickets-services";

const ticketsRouter = Router();
const ticketService = new TicketService();
const ticketController = new TicketController(ticketService);

ticketsRouter.post(
  "/",
  verifyAuthorized(["client"]),

  ticketController.create,
);
ticketsRouter.get("/", ticketController.index);
ticketsRouter.get("/:id", ticketController.show);
ticketsRouter.patch(
  "/",
  verifyAuthorized(["technical", "admin"]),
  ticketController.update,
);

ticketsRouter.post(
  "/services",
  verifyAuthorized(["technical"]),
  ticketController.createTicketService,
);
ticketsRouter.delete(
  "/:ticket_id/services/:ticket_service_id",
  verifyAuthorized(["technical"]),
  ticketController.deleteTicketService,
);

export { ticketsRouter };
