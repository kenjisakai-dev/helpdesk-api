import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export function verifyAuthorized(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    next();
  };
}
