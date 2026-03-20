import { TicketStatus, UserRole } from "@prisma/client";
import { hashPassword } from "@/utils/hash-password";
import { prisma } from "@/database/prisma";

async function seed() {
  const tickets = [
    {
      client: {
        name: "João Pereira",
        email: "joao@email.com",
        password: "123456",
        role: "client",
      },
      technical: {
        name: "Carlos Silva",
        email: "carlos@email.com",
        password: "123456",
        role: "technical",
      },
      service: [
        {
          name: "Instalação de Rede",
          amount: 180,
        },
      ],
      ticket: {
        title: "Rede lenta",
        description: "Minha rede está muito lenta e instável.",
        status: "opened",
      },
    },
    {
      client: {
        name: "João Pereira",
        email: "joao@email.com",
        password: "123456",
        role: "client",
      },
      technical: {
        name: "Carlos Silva",
        email: "carlos@email.com",
        password: "123456",
        role: "technical",
      },
      service: [
        {
          name: "Recuperação de Dados",
          amount: 200,
        },
      ],
      ticket: {
        title: "Backup não está funcionando",
        description: "Meu backup não está funcionando corretamente.",
        status: "opened",
      },
    },
    {
      client: {
        name: "João Pereira",
        email: "joao@email.com",
        password: "123456",
        role: "client",
      },
      technical: {
        name: "Carlos Silva",
        email: "carlos@email.com",
        password: "123456",
        role: "technical",
      },
      service: [
        {
          name: "Manutenção de Hardware",
          amount: 150,
        },
      ],
      ticket: {
        title: "Computador não liga",
        description: "Meu computador parou de funcionar e não liga mais.",
        status: "in_progress",
      },
    },
    {
      client: {
        name: "João Pereira",
        email: "joao@email.com",
        password: "123456",
        role: "client",
      },
      technical: {
        name: "Ana Oliveira",
        email: "ana@email.com",
        password: "123456",
        role: "technical",
      },
      service: [
        {
          name: "Suporte de Software",
          amount: 80,
        },
        {
          name: "Configuração de Dispositivo",
          amount: 120,
        },
      ],
      ticket: {
        title: "Instalação de software de gestão",
        description:
          "Preciso de ajuda para instalar um software de gestão empresarial.",
        status: "closed",
      },
    },
    {
      client: {
        name: "João Pereira",
        email: "joao@email.com",
        password: "123456",
        role: "client",
      },
      technical: {
        name: "Ana Oliveira",
        email: "ana@email.com",
        password: "123456",
        role: "technical",
      },
      service: [
        {
          name: "Suporte de Software",
          amount: 80,
        },
      ],
      ticket: {
        title: "Meu fone não conecta no computador",
        description: "Preciso de ajuda para conectar meu fone ao computador.",
        status: "closed",
      },
    },
  ];
  const hours = [
    7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ];

  await createTickets(tickets);
  await createHours(hours);
}

async function createTickets(tickets: any[]) {
  await prisma.$transaction(
    async (tx) => {
      for (const ticket of tickets) {
        const client = await tx.user.upsert({
          where: { email: ticket.client.email },
          update: {},
          create: {
            name: ticket.client.name,
            email: ticket.client.email,
            password: await hashPassword(ticket.client.password),
            role: "client" as UserRole,
          },
        });

        const technical = await tx.user.upsert({
          where: { email: ticket.technical.email },
          update: {},
          create: {
            name: ticket.technical.name,
            email: ticket.technical.email,
            password: await hashPassword(ticket.technical.password),
            role: "technical" as UserRole,
          },
        });

        const services = [];

        for (const service of ticket.service) {
          const serviceUpsert = await tx.service.upsert({
            where: { name: service.name },
            update: {},
            create: {
              name: service.name,
              amount: service.amount,
            },
          });

          services.push(serviceUpsert);
        }

        const createdTicket = await tx.ticket.create({
          data: {
            title: ticket.ticket.title,
            description: ticket.ticket.description,
            status: ticket.ticket.status as TicketStatus,
            clientId: client.id,
            technicalId: technical.id,
          },
        });

        for (const service of services) {
          await tx.ticketService.create({
            data: {
              ticketId: createdTicket.id,
              serviceId: service.id,
              amount: service.amount,
            },
          });
        }
      }
    },
    {
      maxWait: 10000,
      timeout: 60000,
    },
  );
}

async function createHours(hours: number[]) {
  await prisma.scale.createMany({
    data: hours.map((hour) => ({ hour })),
    skipDuplicates: true,
  });
}

seed()
  .then(() => {
    console.log("Seed finalizado com sucesso!");
  })
  .catch((error) => {
    console.error(`Erro ao finalizar o seed: ${error}`);
  })
  .finally(() => {
    prisma.$disconnect();
  });
