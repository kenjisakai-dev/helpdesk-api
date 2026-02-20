import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

type TaskCreateDTO = {
  title: string;
  description: string;
  service_id: number;
  client_id: number;
};

export class TaskService {
  async create({ title, description, service_id, client_id }: TaskCreateDTO) {
    const service = await prisma.service.findUnique({
      where: {
        id: service_id,
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado");
    }

    const technicals = await prisma.user.findMany({
      where: {
        role: "technical",
      },
    });

    if (technicals.length === 0) {
      throw new AppError("Nenhum técnico disponível");
    }

    const randomIndex = Math.floor(Math.random() * technicals.length);
    const technical = technicals[randomIndex];

    await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title,
          description,
          clientId: client_id,
          technicalId: technical.id,
          status: "opened",
        },
      });

      await tx.ticketService.create({
        data: {
          ticketId: ticket.id,
          serviceId: service_id,
          amount: service.amount,
        },
      });
    });
  }
}
