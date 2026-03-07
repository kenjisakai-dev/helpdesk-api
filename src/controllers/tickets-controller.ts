import { Request, Response } from "express";
import { z } from "zod";
import { TicketService } from "@/services/tickets-services";

export class TicketController {
  constructor(private ticketService: TicketService) {}

  create = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      title: z.string().trim().min(1, "O título é obrigatório"),
      description: z.string().trim().min(10, "A descrição é obrigatória"),
      service_id: z.number("O ID do serviço é obrigatório"),
    });

    const { title, description, service_id } = bodySchema.parse(req.body);
    const client_id = req.user?.user_id;

    await this.ticketService.create({
      title,
      description,
      service_id,
      client_id,
    });

    return res.status(201).json();
  };

  index = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      page: z.coerce
        .number()
        .int("A página deve ser um número inteiro")
        .min(1, "A página mínima é 1")
        .default(1),
      limit: z.coerce
        .number()
        .int("O limite deve ser um número inteiro")
        .min(1, "O limite mínimo é 1")
        .max(50, "O limite máximo é 50")
        .default(10),
    });

    const { page, limit } = bodySchema.parse(req.query);
    const user_id = req.user?.user_id;

    const tickets = await this.ticketService.index({
      user_id,
      page,
      limit,
    });

    return res.json(tickets);
  };

  show = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      id: z.coerce
        .number("O ID do ticket é obrigatório")
        .int("O ID do ticket deve ser um número inteiro"),
    });

    const { id } = bodySchema.parse(req.params);

    const tickets = await this.ticketService.show({ id });

    return res.json(tickets);
  };

  update = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      ticket_id: z
        .number("O ID do ticket é obrigatório")
        .positive("O ID do ticket deve ser um número positivo")
        .int("O ID do ticket deve ser um número inteiro"),
      status: z.enum(["opened", "in_progress", "closed"]),
    });

    const { ticket_id, status } = bodySchema.parse(req.body);

    await this.ticketService.update({ ticket_id, status });

    return res.json();
  };

  createTicketService = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      ticket_id: z
        .number("O ID do ticket é obrigatório")
        .positive("O ID do ticket deve ser um número positivo")
        .int("O ID do ticket deve ser um número inteiro"),
      service_id: z
        .number("O ID do serviço é obrigatório")
        .positive("O ID do serviço deve ser um número positivo")
        .int("O ID do serviço deve ser um número inteiro"),
    });

    const { ticket_id, service_id } = bodySchema.parse(req.body);

    await this.ticketService.createTicketService({ ticket_id, service_id });

    return res.status(201).json();
  };

  deleteTicketService = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      ticket_id: z.coerce
        .number("O ID do ticket deve ser um número")
        .positive("O ID do ticket deve ser um número positivo")
        .int("O ID do ticket deve ser um número inteiro"),
      ticket_service_id: z.coerce
        .number("O ID do serviço do ticket deve ser um número")
        .positive("O ID do serviço do ticket deve ser um número positivo")
        .int("O ID do serviço do ticket deve ser um número inteiro"),
    });

    const { ticket_id, ticket_service_id } = paramsSchema.parse(req.params);

    await this.ticketService.deleteTicketService({
      ticket_id,
      ticket_service_id,
    });

    return res.json();
  };
}
