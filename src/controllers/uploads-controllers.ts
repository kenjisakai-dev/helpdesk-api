import { Request, Response } from "express";
import { UploadService } from "@/services/uploads-services";

export class UploadController {
  constructor(private uploadService: UploadService) {}

  create = async (req: Request, res: Response) => {
    const user_id = req.user.user_id;

    const filename = await this.uploadService.create({
      user_id,
      objFile: req.file,
    });

    return res.status(201).json({ filename });
  };

  delete = async (req: Request, res: Response) => {
    const user_id = req.user.user_id;

    await this.uploadService.delete({ user_id });

    return res.json();
  };
}
