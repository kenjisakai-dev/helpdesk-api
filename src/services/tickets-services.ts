import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

type TicketCreateDTO = {
  title: string;
  description: string;
  service_id: number;
  client_id: number;
};

type TicketIndexDTO = {
  client_id?: number;
  page?: number;
  limit?: number;
};

export class TicketService {
  async create({ title, description, service_id, client_id }: TicketCreateDTO) {
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

  async index({ client_id, page = 1, limit = 5 }: TicketIndexDTO) {
    const skip = (page - 1) * limit;

    const tickets = await prisma.ticket.findMany({
      skip,
      take: limit,
      where: {
        clientId: client_id,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            password: false,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        technical: {
          select: {
            id: true,
            name: true,
            email: true,
            password: false,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        TicketService: {
          include: {
            service: true,
          },
        },
      },
    });

    const statusOrder: Record<string, number> = {
      opened: 0,
      in_progress: 1,
      closed: 2,
    };

    const sortedTickets = tickets.sort((firstTicket, secondTicket) => {
      const firstTicketStatusOrder =
        statusOrder[firstTicket.status] ?? Number.MAX_SAFE_INTEGER;
      const secondTicketStatusOrder =
        statusOrder[secondTicket.status] ?? Number.MAX_SAFE_INTEGER;

      if (firstTicketStatusOrder !== secondTicketStatusOrder) {
        return firstTicketStatusOrder - secondTicketStatusOrder;
      }

      return secondTicket.updatedAt.getTime() - firstTicket.updatedAt.getTime();
    });

    const ticketsWithTotalAmount = sortedTickets.map((ticket) => {
      const total = ticket.TicketService.reduce((total, item) => {
        return total + item.amount;
      }, 0);

      return {
        ...ticket,
        total,
      };
    });

    const ticketsTotal = await prisma.ticket.count({
      where: {
        clientId: client_id,
      },
    });

    const totalPages = Math.ceil(ticketsTotal / limit);
    const totalTickets = ticketsTotal;

    return {
      tickets: ticketsWithTotalAmount,
      pagination: { page, limit, totalPages, totalTickets },
    };
  }
}
