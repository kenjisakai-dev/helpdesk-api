import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";

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
}
