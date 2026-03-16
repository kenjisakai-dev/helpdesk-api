import { Request, Response } from "express";
import { z } from "zod";
import { ServicingService } from "@/services/servicings-services";

export class ServicingController {
  constructor(private servicingService: ServicingService) {}

  create = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      name: z.string().trim().min(1, "O nome é obrigatório"),
      amount: z
        .number("O valor é deve ser um número")
        .positive("O valor deve ser positivo"),
    });

    const { name, amount } = bodySchema.parse(req.body);

    await this.servicingService.create({ name, amount });

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
      status: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
    });

    const { page, limit, status } = bodySchema.parse(req.query);

    const servicings = await this.servicingService.index({
      page,
      limit,
      status,
    });
    return res.json(servicings);
  };

  show = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      id: z.coerce
        .number("O ID deve ser um número")
        .int("O ID deve ser um número inteiro"),
    });

    const { id } = bodySchema.parse(req.params);

    const servicing = await this.servicingService.show({ id });

    return res.json(servicing);
  };

  update = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      id: z.coerce
        .number("O ID deve ser um número")
        .int("O ID deve ser um número inteiro"),
      name: z.string().trim().min(1, "O nome é obrigatório").optional(),
      amount: z
        .number("O valor é obrigatório")
        .positive("O valor deve ser positivo")
        .optional(),
      status: z.boolean("O status deve ser um booleano").optional(),
    });

    const { id, name, amount, status } = bodySchema.parse(req.body);

    await this.servicingService.update({
      id,
      name,
      amount,
      status,
    });

    return res.json();
  };
}
