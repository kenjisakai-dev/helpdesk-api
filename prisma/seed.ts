import { TicketStatus, User, UserRole, Ticket } from "@prisma/client";
import { hashPassword } from "@/utils/hash-password";
import { prisma } from "@/database/prisma";

type UserAdminDTO = Omit<User, "id" | "createdAt" | "updatedAt">;

async function seed() {
  const clients = [
    {
      name: "João Pereira",
      email: "joao@email.com",
      password: "123456",
      role: "client",
    },
  ];

  const technicals = [
    {
      name: "Carlos Silva",
      email: "carlos@email.com",
      password: "123456",
      role: "technical",
    },
    {
      name: "Ana Oliveira",
      email: "ana@email.com",
      password: "123456",
      role: "technical",
    },
    {
      name: "Camila Santos",
      email: "camila@email.com",
      password: "123456",
      role: "technical",
    },
  ];

  const services = [
    { name: "Instalação de Rede", amount: 180 },
    { name: "Recuperação de Dados", amount: 200 },
    { name: "Manutenção de Hardware", amount: 150 },
    { name: "Suporte de Software", amount: 80 },
    { name: "Configuração de Dispositivo", amount: 120 },
  ];

  const tickets = [
    {
      client: clients[0],
      technical: technicals[0],
      service: [services[0]],
      ticket: {
        title: "Rede lenta",
        description: "Minha rede está muito lenta e instável.",
        status: "opened",
      },
    },
    {
      client: clients[0],
      technical: technicals[0],
      service: [services[1]],
      ticket: {
        title: "Backup não está funcionando",
        description: "Meu backup não está funcionando corretamente.",
        status: "opened",
      },
    },
    {
      client: clients[0],
      technical: technicals[0],
      service: [services[2]],
      ticket: {
        title: "Computador não liga",
        description: "Meu computador parou de funcionar e não liga mais.",
        status: "in_progress",
      },
    },
    {
      client: clients[0],
      technical: technicals[1],
      service: [services[3], services[4]],
      ticket: {
        title: "Instalação de software de gestão",
        description:
          "Preciso de ajuda para instalar um software de gestão empresarial.",
        status: "closed",
      },
    },
    {
      client: clients[0],
      technical: technicals[1],
      service: [services[3]],
      ticket: {
        title: "Meu fone não conecta no computador",
        description: "Preciso de ajuda para conectar meu fone ao computador.",
        status: "closed",
      },
    },
    {
      client: clients[0],
      technical: technicals[2],
      service: [services[4]],
      ticket: {
        title: "Computador não conecta a rede Wi-Fi",
        description:
          "Preciso de ajuda para conectar meu computador à rede Wi-Fi",
        status: "closed",
      },
    },
  ];

  const hours = [
    7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ];

  const userAdmin: UserAdminDTO = {
    name: "Admin User",
    email: "admin@email.com",
    password: await hashPassword("123456"),
    role: "admin" as UserRole,
    status: true,
  };

  await createTickets(tickets);
  await createHours(hours);
  await createUserAdmin(userAdmin);
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

async function createUserAdmin(userAdmin: UserAdminDTO) {
  await prisma.user.upsert({
    where: { email: userAdmin.email },
    create: {
      name: userAdmin.name,
      email: userAdmin.email,
      password: userAdmin.password,
      role: userAdmin.role,
      status: userAdmin.status,
    },
    update: {},
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
