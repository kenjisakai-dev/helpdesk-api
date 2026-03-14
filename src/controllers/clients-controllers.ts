import { Request, Response } from "express";
import { z } from "zod";
import { ClientService } from "@/services/clients-services";

export class ClientController {
  constructor(private clientService: ClientService) {}

  update = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      user_id: z.number().int("O ID deve ser um número inteiro"),
      name: z.string().trim().min(1, "Nome é obrigatório").optional(),
      email: z.email("Email inválido").trim().toLowerCase().optional(),
    });

    const { user_id, name, email } = bodySchema.parse(req.body);

    await this.clientService.update({
      user_id,
      name,
      email,
    });

    return res.json();
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

    const clients = await this.clientService.index({ page, limit });

    return res.json(clients);
  };

  show = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      id: z.coerce
        .number("O ID deve ser um número")
        .int("O ID deve ser um número inteiro"),
    });

    const { id } = paramsSchema.parse(req.params);

    const client = await this.clientService.show({
      user_id: id,
    });

    return res.json(client);
  };

  delete = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      id: z.coerce
        .number("O ID deve ser um número")
        .int("O ID deve ser um número inteiro"),
    });

    const { id } = paramsSchema.parse(req.params);

    await this.clientService.delete({
      user_id: id,
    });

    return res.json();
  };
}
