import { compare } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";
import { hashPassword } from "@/utils/hash-password";

type User = {
  name: string;
  email: string;
  password: string;
};

type UpdateUser = {
  user_id: number;
  name?: string;
  email?: string;
};

type ChangePasswordUser = {
  user_id: number;
  currentPassword: string;
  newPassword: string;
};

export class UserService {
  async create({ name, email, password }: User) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }

  async update({ user_id, name, email }: UpdateUser) {
    const userExists = await prisma.user.findUnique({
      where: { id: user_id, status: true },
    });

    if (!userExists) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (email) {
      const userByEmailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userByEmailExists) {
        throw new AppError("Email já existente");
      }
    }

    await prisma.user.update({
      where: { id: user_id },
      data: { name, email },
    });
  }

  async delete(user_id: number) {
    const userExists = await prisma.user.findUnique({
      where: { id: user_id, status: true },
    });

    if (!userExists) {
      throw new AppError("Usuário não encontrado", 404);
    }

    await prisma.user.update({
      where: { id: user_id },
      data: { status: false },
    });
  }

  async changePassword({
    user_id,
    currentPassword,
    newPassword,
  }: ChangePasswordUser) {
    const userExists = await prisma.user.findUnique({
      where: { id: user_id, status: true },
    });

    if (!userExists) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const comparePassword = await compare(currentPassword, userExists.password);

    if (!comparePassword) {
      throw new AppError("Senha atual incorreta");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user_id },
      data: { password: hashedPassword },
    });
  }
}
