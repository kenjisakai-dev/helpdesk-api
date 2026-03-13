import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";
import { hashPassword } from "@/utils/hash-password";

type TechnicalCreateDTO = {
  name: string;
  email: string;
  password: string;
  scales_id: number[];
};

type TechnicalUpdateDTO = {
  user_id: number;
  name?: string;
  email?: string;
  scales_id?: number[];
};

type TechnicalIndexDTO = {
  page: number;
  limit: number;
};

type TechnicalShowDTO = {
  user_id: number;
};

export class TechnicalService {
  async create({ name, email, password, scales_id }: TechnicalCreateDTO) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = await hashPassword(password);

    const userCreated = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "technical",
      },
    });

    const scales = await prisma.scale.findMany({
      where: {
        id: {
          in: scales_id,
        },
      },
      select: { id: true },
    });

    const data = scales.map((scale) => ({
      userId: userCreated.id,
      scaleId: scale.id,
    }));

    await prisma.userScale.createMany({
      data,
    });
  }

  async update({ user_id, name, email, scales_id }: TechnicalUpdateDTO) {
    const user = await prisma.user.findUnique({
      where: { id: user_id, status: true },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (userByEmail && userByEmail.id !== user_id) {
        throw new AppError("Email já cadastrado");
      }
    }

    await prisma.user.update({
      where: { id: user_id },
      data: { name, email },
    });

    if (!scales_id) return;

    await prisma.userScale.deleteMany({
      where: { userId: user_id },
    });

    const scales = await prisma.scale.findMany({
      where: {
        id: {
          in: scales_id,
        },
      },
      select: { id: true },
    });

    const data = scales.map((scale) => ({
      userId: user_id,
      scaleId: scale.id,
    }));

    await prisma.userScale.createMany({
      data,
    });
  }

  async index({ page, limit }: TechnicalIndexDTO) {
    const skip = (page - 1) * limit;

    const technicals = await prisma.user.findMany({
      skip,
      take: limit,
      where: { role: "technical", status: true },
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

    const ticketsTechnicals = await prisma.user.count({
      where: { role: "technical", status: true },
    });

    const totalPages = Math.ceil(ticketsTechnicals / limit);
    const totalItems = ticketsTechnicals;

    return {
      data: technicals,
      pagination: { page, limit, totalPages, totalItems },
    };
  }

  async show({ user_id }: TechnicalShowDTO) {
    const technical = await prisma.user.findFirst({
      where: { id: user_id, role: "technical", status: true },
      select: {
        id: true,
        name: true,
        email: true,
        password: false,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userScales: {
          select: {
            id: true,
            scaleId: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            scale: {
              select: {
                id: true,
                hour: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!technical) {
      throw new AppError("Técnico não encontrado", 404);
    }

    return technical;
  }
}
