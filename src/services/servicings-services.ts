import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

type CreateServicingDTO = {
  name: string;
  amount: number;
};

type UpdateServicingDTO = {
  id: number;
  name?: string;
  amount?: number;
  status?: boolean;
};

type ServicingIndexDTO = {
  page: number;
  limit: number;
  status?: boolean;
};

type ShowServicingDTO = {
  id: number;
};
export class ServicingService {
  async create({ name, amount }: CreateServicingDTO) {
    const service = await prisma.service.findFirst({
      where: { name },
    });

    if (service) {
      throw new AppError("Serviço já existente");
    }

    await prisma.service.create({
      data: {
        name,
        amount,
        status: true,
      },
    });
  }

  async update({ id, name, amount, status }: UpdateServicingDTO) {
    const service = await prisma.service.findFirst({
      where: { id },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado", 404);
    }

    await prisma.service.update({
      where: { id },
      data: {
        name,
        amount,
        status,
      },
    });
  }

  async index({ page, limit, status }: ServicingIndexDTO) {
    const skip = (page - 1) * limit;

    let filter: Prisma.ServiceWhereInput = {};

    if (status === undefined) {
      filter = {};
    } else {
      filter.status = status;
    }

    const services = await prisma.service.findMany({
      skip,
      take: limit,
      where: filter,
      orderBy: { name: "asc" },
    });

    const servicesTotal = await prisma.service.count({
      where: filter,
    });

    const totalPages = Math.ceil(servicesTotal / limit);
    const totalItems = servicesTotal;

    return {
      data: services,
      pagination: { page, limit, totalPages, totalItems },
    };
  }

  async show({ id }: ShowServicingDTO) {
    const service = await prisma.service.findFirst({
      where: { id },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado", 404);
    }

    return service;
  }
}
