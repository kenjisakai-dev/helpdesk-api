import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";
import { Prisma, TicketStatus } from "@prisma/client";

type TicketCreateDTO = {
  title: string;
  description: string;
  service_id: number;
  client_id: number;
};

type TicketIndexDTO = {
  user_id?: number;
  page?: number;
  limit?: number;
};

type TicketUpdateDTO = {
  ticket_id: number;
  status: TicketStatus;
};

type TicketServiceCreateDTO = {
  ticket_id: number;
  service_id: number;
};

type TicketServiceDeleteDTO = {
  ticket_id: number;
  ticket_service_id: number;
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

  async index({ user_id, page = 1, limit = 5 }: TicketIndexDTO) {
    const skip = (page - 1) * limit;

    let filter: Prisma.TicketWhereInput = {};

    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (user?.role === "technical") {
      filter = {
        technicalId: user.id,
      };
    } else {
      filter = {
        clientId: user.id,
      };
    }

    const tickets = await prisma.ticket.findMany({
      skip,
      take: limit,
      where: filter,
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
        ticketServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });

    const ticketsWithTotalAmount = tickets.map((ticket) => {
      const total = ticket.ticketServices.reduce((total, item) => {
        return total + item.amount;
      }, 0);

      return {
        ...ticket,
        total,
      };
    });

    const ticketsTotal = await prisma.ticket.count({
      where: filter,
    });

    const totalPages = Math.ceil(ticketsTotal / limit);
    const totalTickets = ticketsTotal;

    return {
      tickets: ticketsWithTotalAmount,
      pagination: { page, limit, totalPages, totalTickets },
    };
  }

  async show({ id }: { id: number }) {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id,
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
        ticketServices: {
          include: {
            service: true,
          },
        },
      },
    });

    const totalAmount = ticket?.ticketServices.reduce((total, service) => {
      return total + service.amount;
    }, 0);

    return {
      ...ticket,
      total: totalAmount,
    };
  }

  async update({ ticket_id, status }: TicketUpdateDTO) {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticket_id,
      },
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    await prisma.ticket.update({
      where: {
        id: ticket_id,
      },
      data: {
        status,
      },
    });
  }

  async createTicketService({ ticket_id, service_id }: TicketServiceCreateDTO) {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticket_id,
      },
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    const service = await prisma.service.findUnique({
      where: {
        id: service_id,
      },
    });

    if (!service) {
      throw new AppError("Serviço não encontrado", 404);
    }

    await prisma.ticketService.create({
      data: {
        ticketId: ticket_id,
        serviceId: service_id,
        amount: service.amount,
      },
    });
  }

  async deleteTicketService({
    ticket_id,
    ticket_service_id,
  }: TicketServiceDeleteDTO) {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticket_id,
      },
      include: {
        ticketServices: {
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!ticket) {
      throw new AppError("Ticket não encontrado", 404);
    }

    if (ticket.status === "closed") {
      throw new AppError(
        "Não é possível excluir serviços de um ticket fechado",
        400,
      );
    }

    const ticketServiceBase = ticket.ticketServices[0] ?? null;

    if (ticketServiceBase?.id === ticket_service_id) {
      throw new AppError("O serviço base do ticket não pode ser deletado", 400);
    }

    const ticketServiceExclude = ticket.ticketServices.find(
      (ts) => ts.id === ticket_service_id,
    );

    if (!ticketServiceExclude) {
      throw new AppError("Serviço do ticket não encontrado", 404);
    }

    await prisma.ticketService.delete({
      where: {
        id: ticket_service_id,
      },
    });
  }
}
