import { Request, Response } from "express";
import { z } from "zod";
import { SessionService } from "@/services/sessions-services";

export class SessionsController {
  constructor(private sessionService: SessionService) {}

  create = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      email: z.email("E-mail inválido").toLowerCase(),
      password: z.string().trim().min(1, "Informe a senha"),
    });

    const { email, password } = bodySchema.parse(req.body);

    const response = await this.sessionService.create({ email, password });

    return res.status(200).json(response);
  };
}
