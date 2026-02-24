import { Request, Response } from "express";
import { ServicingService } from "@/services/servicings-services";

export class ServicingController {
  constructor(private servicingService: ServicingService) {}

  index = async (req: Request, res: Response) => {
    const servicings = await this.servicingService.index();
    return res.json(servicings);
  };
}
