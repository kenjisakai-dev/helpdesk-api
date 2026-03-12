import { Request, Response } from "express";
import { z } from "zod";
import { UserService } from "@/services/users-services";

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      name: z.string().trim().min(1, "Nome é obrigatório"),
      email: z.email("Email inválido").trim().toLowerCase(),
      password: z
        .string("Senha é obrigatória")
        .trim()
        .min(6, "A senha deve conter no mínimo 6 caracteres"),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    await this.userService.create({ name, email, password });

    return res.status(201).json();
  };

  update = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      name: z.string().trim().min(1, "Nome é obrigatório").optional(),
      email: z.email("Email inválido").optional(),
    });

    const { name, email } = bodySchema.parse(req.body);
    const user_id = req.user?.user_id;

    await this.userService.update({ user_id, name, email });

    return res.json();
  };

  delete = async (req: Request, res: Response) => {
    const user_id = req.user?.user_id;

    await this.userService.delete(user_id);

    return res.json();
  };

  changePassword = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      currentPassword: z.string().min(1, "Senha é obrigatória"),
      newPassword: z
        .string("Senha é obrigatória")
        .trim()
        .min(6, "A senha deve conter no mínimo 6 caracteres"),
    });

    const { currentPassword, newPassword } = bodySchema.parse(req.body);
    const user_id = req.user?.user_id;

    await this.userService.changePassword({
      user_id,
      currentPassword,
      newPassword,
    });

    return res.json();
  };

  indexTechnicals = async (req: Request, res: Response) => {
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

    const technicals = await this.userService.indexTechnicals({ page, limit });

    return res.json(technicals);
  };

  createTechnical = async (req: Request, res: Response) => {
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

    await this.userService.createTechnical({
      name,
      email,
      password,
      scales_id,
    });

    return res.status(201).json();
  };
}
