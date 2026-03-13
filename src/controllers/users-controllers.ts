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
}
