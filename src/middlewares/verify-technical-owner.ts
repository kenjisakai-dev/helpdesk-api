import { AppError } from "@/utils/app-error";
import { Request, Response, NextFunction } from "express";

export function verifyTechnicalOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user.role === "admin") {
    return next();
  }

  const technicalId = Number(req.params.id);

  if (technicalId !== req.user.user_id) {
    throw new AppError("Acesso negado", 403);
  }

  return next();
}
