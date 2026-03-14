import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

type ClientUpdateDTO = {
  user_id: number;
  name?: string;
  email?: string;
};

type ClientIndexDTO = {
  page: number;
  limit: number;
};

type ClientShowDTO = {
  user_id: number;
};

type ClientDeleteDTO = {
  user_id: number;
};

export class ClientService {
  async update({ user_id, name, email }: ClientUpdateDTO) {
    const userExists = await prisma.user.findUnique({
      where: { id: user_id, role: "client", status: true },
    });

    if (!userExists) {
      throw new AppError("Cliente não encontrado", 404);
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

  async index({ page, limit }: ClientIndexDTO) {
    const skip = (page - 1) * limit;

    const clients = await prisma.user.findMany({
      skip,
      take: limit,
      where: { role: "client", status: true },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });

    const totalClients = await prisma.user.count({
      where: { role: "client", status: true },
    });

    const totalPages = Math.ceil(totalClients / limit);
    const totalItems = totalClients;

    return {
      data: clients,
      pagination: { page, limit, totalPages, totalItems },
    };
  }

  async show({ user_id }: ClientShowDTO) {
    const client = await prisma.user.findFirst({
      where: { id: user_id, role: "client", status: true },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    return client;
  }

  async delete({ user_id }: ClientDeleteDTO) {
    const client = await prisma.user.findUnique({
      where: { id: user_id, role: "client", status: true },
    });

    if (!client) {
      throw new AppError("Cliente não encontrado", 404);
    }

    await prisma.user.update({
      where: { id: user_id },
      data: { status: false },
    });
  }
}
