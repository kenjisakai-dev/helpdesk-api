import { Request, Response } from "express";
import { z } from "zod";
import { ScaleService } from "@/services/scales-services";

export class ScaleController {
  constructor(private scaleService: ScaleService) {}

  index = async (req: Request, res: Response) => {
    const scales = await this.scaleService.index();

    return res.json(scales);
  };

  createScaleUser = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      user_id: z
        .number("ID do usuário deve ser um número")
        .int("ID do usuário deve ser um número inteiro"),
      scales_id: z.array(
        z
          .number("ID da escala deve ser um número")
          .int("ID da escala deve ser um número inteiro"),
      ),
    });

    const { user_id, scales_id } = bodySchema.parse(req.body);

    await this.scaleService.createScaleUser({ user_id, scales_id });

    return res.status(201).json();
  };

  showScaleUsers = async (req: Request, res: Response) => {
    const paramsSchema = z.object({
      user_id: z.coerce
        .number("ID do usuário deve ser um número")
        .int("ID do usuário deve ser um número inteiro"),
    });

    const { user_id } = paramsSchema.parse(req.params);

    const userScales = await this.scaleService.showScaleUsers({ user_id });

    return res.json(userScales);
  };
}
