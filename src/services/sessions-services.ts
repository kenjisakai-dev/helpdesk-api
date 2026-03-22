import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { prisma } from "@/database/prisma";
import { authConfig } from "@/configs/auth-config";
import { AppError } from "@/utils/app-error";

type Login = {
  email: string;
  password: string;
};

export class SessionService {
  async create({ email, password }: Login) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("E-mail e/ou senha inválidos", 401);
    }

    const comparePassword = await compare(password, user.password);

    if (!comparePassword) {
      throw new AppError("E-mail e/ou senha inválidos", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({ user_id: user.id, role: user.role }, secret, {
      expiresIn,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }
}
