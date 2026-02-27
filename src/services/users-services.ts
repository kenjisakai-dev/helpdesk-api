import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

type User = {
  name: string;
  email: string;
  password: string;
};

export class UserService {
  async create({ name, email, password }: User) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = await hash(password, 8);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }

  async delete(user_id: number) {
    const userExists = await prisma.user.count({
      where: { id: user_id, status: true },
    });

    if (userExists === 0) {
      throw new AppError("Usuário não encontrado");
    }

    await prisma.user.update({
      where: { id: user_id },
      data: { status: false },
    });
  }
}
