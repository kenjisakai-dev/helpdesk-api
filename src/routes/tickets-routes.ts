import { TicketController } from "@/controllers/tickets-controller";
import { TicketService } from "@/services/tickets-services";
import { Router } from "express";

const ticketsRouter = Router();
const ticketService = new TicketService();
const ticketController = new TicketController(ticketService);

ticketsRouter.post("/", ticketController.create);
ticketsRouter.get("/", ticketController.index);
ticketsRouter.get("/:id", ticketController.show);

export { ticketsRouter };
