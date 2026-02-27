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

  delete = async (req: Request, res: Response) => {
    const user_id = req.user?.user_id;

    await this.userService.delete(user_id);

    return res.json();
  };
}
