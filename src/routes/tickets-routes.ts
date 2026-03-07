import { TicketController } from "@/controllers/tickets-controller";
import { TicketService } from "@/services/tickets-services";
import { Router } from "express";

const ticketsRouter = Router();
const ticketService = new TicketService();
const ticketController = new TicketController(ticketService);

ticketsRouter.post("/", ticketController.create);
ticketsRouter.get("/", ticketController.index);
ticketsRouter.get("/:id", ticketController.show);
ticketsRouter.patch("/", ticketController.update);

ticketsRouter.post("/services", ticketController.createTicketService);
ticketsRouter.delete(
  "/:ticket_id/services/:ticket_service_id",
  ticketController.deleteTicketService,
);

export { ticketsRouter };
