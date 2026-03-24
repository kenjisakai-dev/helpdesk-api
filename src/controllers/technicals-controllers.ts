import { Request, Response } from "express";
import { z } from "zod";
import { TechnicalService } from "@/services/technicals-services";

export class TechnicalController {
  constructor(private technicalService: TechnicalService) {}

  create = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      name: z.string().trim().min(1, "Nome é obrigatório"),
      email: z.email("Email inválido").trim().toLowerCase(),
      password: z
        .string("Senha é obrigatória")
        .trim()
        .min(6, "A senha deve conter no mínimo 6 caracteres"),
      scales_id: z
        .array(z.number("O ID deve ser um número"))
        .min(1, "Escolha ao menos uma escala"),
    });

    const { name, email, password, scales_id } = bodySchema.parse(req.body);

    await this.technicalService.create({
      name,
      email,
      password,
      scales_id,
    });

    return res.status(201).json();
  };

  update = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      user_id: z.number().int("O ID deve ser um número inteiro"),
      name: z.string().trim().min(1, "Nome é obrigatório").optional(),
      email: z.email("Email inválido").trim().toLowerCase().optional(),
      scales_id: z
        .array(z.number("O ID deve ser um número"))
        .min(1, "Escolha ao menos uma escala"),
    });

    const { user_id, name, email, scales_id } = bodySchema.parse(req.body);

    await this.technicalService.update({
      user_id,
      name,
      email,
      scales_id,
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

    const technicals = await this.technicalService.index({ page, limit });

    return res.json(technicals);
  };

  show = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      id: z.coerce
        .number("O ID deve ser um número")
        .int("O ID deve ser um número inteiro"),
    });

    const { id } = paramsSchema.parse(req.params);

    const technical = await this.technicalService.show({
      user_id: id,
    });

    return res.json(technical);
  };
}
