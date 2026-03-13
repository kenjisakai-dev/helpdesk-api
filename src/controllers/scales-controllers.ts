import { Request, Response } from "express";
import { ScaleService } from "@/services/scales-services";

export class ScaleController {
  constructor(private scaleService: ScaleService) {}

  index = async (req: Request, res: Response) => {
    const scales = await this.scaleService.index();

    return res.json(scales);
  };
}
