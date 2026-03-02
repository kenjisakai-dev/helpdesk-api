import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { TicketStatus, UserRole } from "@prisma/client";

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

  // await prisma.user.createMany({
  //   data: [
  //     {
  //       name: "Kenji Sakai",
  //       email: "kenji@email.com",
  //       password: await hashPassword("123456"),
  //       role: "admin",
  //     },
  //     {
  //       name: "Carlos Silva",
  //       email: "carlos@email.com",
  //       password: await hashPassword("123456"),
  //       role: "technical",
  //     },
  //     {
  //       name: "Ana Oliveira",
  //       email: "ana@email.com",
  //       password: await hashPassword("123456"),
  //       role: "technical",
  //     },
  //     {
  //       name: "João Pereira",
  //       email: "joao@email.com",
  //       password: await hashPassword("123456"),
  //       role: "client",
  //     },
  //   ],
  //   skipDuplicates: true,
  // });

  // await prisma.service.createMany({
  //   data: [
  //     {
  //       name: "Instalação de Rede",
  //       amount: 180,
  //     },
  //     {
  //       name: "Recuperação de Dados",
  //       amount: 200,
  //     },
  //     {
  //       name: "Manutenção de Hardware",
  //       amount: 150,
  //     },
  //     {
  //       name: "Suporte de Software",
  //       amount: 200,
  //     },
  //     {
  //       name: "Configuração de Dispositivo",
  //       amount: 120,
  //     },
  //     // {
  //     //   name: "Instalação e atualização de softwares",
  //     //   amount: 100,
  //     // },
  //     // {
  //     //   name: "Instalação e atualização de hardwares",
  //     //   amount: 150,
  //     // },
  //     // {
  //     //   name: "Diagnóstico e remoção de vírus",
  //     //   amount: 200,
  //     // },
  //     // {
  //     //   name: "Suporte a impressoras",
  //     //   amount: 50,
  //     // },
  //     // {
  //     //   name: "Suporte a periféricos",
  //     //   amount: 80,
  //     // },
  //     // {
  //     //   name: "Solução de problemas de conectividade de internet",
  //     //   amount: 120,
  //     // },
  //     // {
  //     //   name: "Backup e recuperação de dados",
  //     //   amount: 200,
  //     // },
  //     // {
  //     //   name: "Otimização de desempenho do sistema operacional",
  //     //   amount: 130,
  //     // },
  //     // {
  //     //   name: "Configuração de VPN e Acesso Remoto",
  //     //   amount: 90,
  //     // },
  //   ],
  //   skipDuplicates: true,
  // });
}

async function hashPassword(password: string) {
  return await hash(password, 8);
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
