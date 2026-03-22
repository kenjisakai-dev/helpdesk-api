import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

export function verifyUser(
  object: "params" | "body" | "query" | "user",
  field: string,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req[object][field];

    const user = await prisma.user.findFirst({
      where: {
        id: user_id,
        status: true,
      },
    });

    if (!user) {
      throw new AppError("Usuário inativo", 401);
    }

    next();
  };
}
