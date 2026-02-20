import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@/utils/app-error";
import { authConfig } from "@/configs/auth-config";

type JwtPayload = {
  user_id: number;
  role: string;
};

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new AppError("Token é obrigatório", 401);
  }

  try {
    const token = authorization.replace("Bearer ", "");

    const { secret } = authConfig.jwt;

    const { user_id, role } = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      user_id,
      role,
    };

    return next();
  } catch (err) {
    throw new AppError("Token inválido", 401);
  }
}
