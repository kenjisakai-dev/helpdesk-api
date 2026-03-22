import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

const defaultPasswordHash =
  "$2b$08$4dVmvVbQSMhAwLrS49DWb.p3sNZNVYP4jksvneGv4HT5tm9aprESm";

describe("TicketsController", () => {
  const createUser = async ({
    name,
    email,
    role,
  }: {
    name: string;
    email: string;
    role: "admin" | "technical" | "client";
  }) => {
    return prisma.user.create({
      data: {
        name,
        email,
        role,
        password: defaultPasswordHash,
      },
    });
  };

  const createService = async ({
    name,
    amount,
    status = true,
  }: {
    name: string;
    amount: number;
    status?: boolean;
  }) => {
    return prisma.service.create({
      data: {
        name,
        amount,
        status,
      },
    });
  };

  const createTicket = async ({
    title,
    description,
    clientId,
    technicalId,
    status = "opened",
  }: {
    title: string;
    description: string;
    clientId: number;
    technicalId: number;
    status?: "opened" | "in_progress" | "closed";
  }) => {
    return prisma.ticket.create({
      data: {
        title,
        description,
        clientId,
        technicalId,
        status,
      },
    });
  };

  const createTicketService = async ({
    ticketId,
    serviceId,
    amount,
  }: {
    ticketId: number;
    serviceId: number;
    amount: number;
  }) => {
    return prisma.ticketService.create({
      data: {
        ticketId,
        serviceId,
        amount,
      },
    });
  };

  const authenticate = async (email: string) => {
    const response = await request(app).post("/sessions").send({
      email,
      password: "123456",
    });

    return response.body.token as string;
  };

  beforeEach(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
  });

  it("deve negar criação de ticket para usuário sem perfil client", async () => {
    await createUser({
      name: "Technical User",
      email: "technical_ticket_create@email.com",
      role: "technical",
    });

    await createUser({
      name: "Technical Available",
      email: "technical_available@email.com",
      role: "technical",
    });

    const service = await createService({
      name: "Diagnóstico",
      amount: 80,
    });

    const token = await authenticate("technical_ticket_create@email.com");

    const response = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Erro no sistema",
        description: "Descrição longa de erro no sistema para abrir ticket",
        service_id: service.id,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve criar ticket com client e gerar serviço base", async () => {
    const client = await createUser({
      name: "Client User",
      email: "client_ticket_create@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Available",
      email: "technical_available_create@email.com",
      role: "technical",
    });

    const service = await createService({
      name: "Suporte Remoto",
      amount: 120,
    });

    const token = await authenticate("client_ticket_create@email.com");

    const response = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Falha na aplicação",
        description: "A aplicação fecha ao tentar salvar os dados do cliente",
        service_id: service.id,
      });

    const createdTicket = await prisma.ticket.findFirst({
      where: { clientId: client.id },
      include: { ticketServices: true },
    });

    expect(response.status).toBe(201);
    expect(createdTicket?.technicalId).toBe(technical.id);
    expect(createdTicket?.status).toBe("opened");
    expect(createdTicket?.ticketServices).toHaveLength(1);
    expect(createdTicket?.ticketServices[0].amount).toBe(service.amount);
  });

  it("deve listar tickets filtrando por client autenticado", async () => {
    const clientA = await createUser({
      name: "Client A",
      email: "client_a_ticket_index@email.com",
      role: "client",
    });

    const clientB = await createUser({
      name: "Client B",
      email: "client_b_ticket_index@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Index",
      email: "technical_ticket_index@email.com",
      role: "technical",
    });

    const service = await createService({
      name: "Atendimento",
      amount: 55,
    });

    const ticketA = await createTicket({
      title: "Ticket Client A",
      description: "Descrição do ticket do client A com detalhes",
      clientId: clientA.id,
      technicalId: technical.id,
    });

    const ticketB = await createTicket({
      title: "Ticket Client B",
      description: "Descrição do ticket do client B com detalhes",
      clientId: clientB.id,
      technicalId: technical.id,
    });

    await createTicketService({
      ticketId: ticketA.id,
      serviceId: service.id,
      amount: service.amount,
    });

    await createTicketService({
      ticketId: ticketB.id,
      serviceId: service.id,
      amount: service.amount,
    });

    const token = await authenticate("client_a_ticket_index@email.com");

    const response = await request(app)
      .get("/tickets")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10 })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(ticketA.id);
    expect(response.body.data[0].client.id).toBe(clientA.id);
    expect(response.body.data[0].client).not.toHaveProperty("password");
    expect(response.body.data[0].technical).not.toHaveProperty("password");
    expect(response.body.data[0].total).toBe(55);
  });

  it("deve obter ticket por id com total e dados sem senha", async () => {
    const client = await createUser({
      name: "Client Show",
      email: "client_ticket_show@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Show",
      email: "technical_ticket_show@email.com",
      role: "technical",
    });

    const serviceA = await createService({
      name: "Mão de obra",
      amount: 100,
    });

    const serviceB = await createService({
      name: "Peça adicional",
      amount: 60,
    });

    const ticket = await createTicket({
      title: "Ticket Show",
      description: "Descrição para testar o endpoint show do ticket",
      clientId: client.id,
      technicalId: technical.id,
    });

    await createTicketService({
      ticketId: ticket.id,
      serviceId: serviceA.id,
      amount: serviceA.amount,
    });

    await createTicketService({
      ticketId: ticket.id,
      serviceId: serviceB.id,
      amount: serviceB.amount,
    });

    const token = await authenticate("client_ticket_show@email.com");

    const response = await request(app)
      .get(`/tickets/${ticket.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(ticket.id);
    expect(response.body.client).not.toHaveProperty("password");
    expect(response.body.technical).not.toHaveProperty("password");
    expect(response.body.total).toBe(160);
  });

  it("deve negar atualização de status para usuário client", async () => {
    const client = await createUser({
      name: "Client Update",
      email: "client_ticket_update@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Update",
      email: "technical_ticket_update@email.com",
      role: "technical",
    });

    const ticket = await createTicket({
      title: "Ticket Update",
      description: "Descrição para testar atualização de ticket",
      clientId: client.id,
      technicalId: technical.id,
    });

    const token = await authenticate("client_ticket_update@email.com");

    const response = await request(app)
      .patch("/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ticket_id: ticket.id,
        status: "closed",
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve atualizar status do ticket com usuário technical", async () => {
    const client = await createUser({
      name: "Client Update Ok",
      email: "client_ticket_update_ok@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Update Ok",
      email: "technical_ticket_update_ok@email.com",
      role: "technical",
    });

    const ticket = await createTicket({
      title: "Ticket Update Ok",
      description: "Descrição para atualizar status com technical",
      clientId: client.id,
      technicalId: technical.id,
      status: "opened",
    });

    const token = await authenticate("technical_ticket_update_ok@email.com");

    const response = await request(app)
      .patch("/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ticket_id: ticket.id,
        status: "in_progress",
      });

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });

    expect(response.status).toBe(200);
    expect(updatedTicket?.status).toBe("in_progress");
  });

  it("deve negar criação de serviço adicional por usuário sem perfil technical", async () => {
    const client = await createUser({
      name: "Client Service Add",
      email: "client_ticket_service_add@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Service Add",
      email: "technical_ticket_service_add@email.com",
      role: "technical",
    });

    const ticket = await createTicket({
      title: "Ticket Service Add",
      description: "Descrição para testar criação de serviço adicional",
      clientId: client.id,
      technicalId: technical.id,
    });

    const service = await createService({
      name: "Adicional",
      amount: 45,
    });

    const token = await authenticate("client_ticket_service_add@email.com");

    const response = await request(app)
      .post("/tickets/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ticket_id: ticket.id,
        service_id: service.id,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve criar serviço adicional no ticket com usuário technical", async () => {
    const client = await createUser({
      name: "Client Service Add Ok",
      email: "client_ticket_service_add_ok@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Service Add Ok",
      email: "technical_ticket_service_add_ok@email.com",
      role: "technical",
    });

    const baseService = await createService({
      name: "Base Add",
      amount: 100,
    });

    const extraService = await createService({
      name: "Extra Add",
      amount: 35,
    });

    const ticket = await createTicket({
      title: "Ticket Service Add Ok",
      description: "Descrição para criar serviço adicional com technical",
      clientId: client.id,
      technicalId: technical.id,
    });

    await createTicketService({
      ticketId: ticket.id,
      serviceId: baseService.id,
      amount: baseService.amount,
    });

    const token = await authenticate(
      "technical_ticket_service_add_ok@email.com",
    );

    const response = await request(app)
      .post("/tickets/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ticket_id: ticket.id,
        service_id: extraService.id,
      });

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: { ticketServices: true },
    });

    expect(response.status).toBe(201);
    expect(updatedTicket?.ticketServices).toHaveLength(2);
    expect(
      updatedTicket?.ticketServices.some(
        (item) => item.serviceId === extraService.id && item.amount === 35,
      ),
    ).toBe(true);
  });

  it("deve impedir adicionar serviço em ticket fechado", async () => {
    const client = await createUser({
      name: "Client Service Closed Add",
      email: "client_ticket_service_closed_add@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Service Closed Add",
      email: "technical_ticket_service_closed_add@email.com",
      role: "technical",
    });

    const baseService = await createService({
      name: "Base Closed Add",
      amount: 100,
    });

    const extraService = await createService({
      name: "Extra Closed Add",
      amount: 25,
    });

    const ticket = await createTicket({
      title: "Ticket Closed Add",
      description: "Descrição para bloquear adição de serviço em ticket fechado",
      clientId: client.id,
      technicalId: technical.id,
      status: "closed",
    });

    await createTicketService({
      ticketId: ticket.id,
      serviceId: baseService.id,
      amount: baseService.amount,
    });

    const token = await authenticate(
      "technical_ticket_service_closed_add@email.com",
    );

    const response = await request(app)
      .post("/tickets/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ticket_id: ticket.id,
        service_id: extraService.id,
      });

    const ticketAfterRequest = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: { ticketServices: true },
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Não é possível adicionar serviços em um ticket fechado",
    );
    expect(ticketAfterRequest?.ticketServices).toHaveLength(1);
  });

  it("deve impedir exclusão do serviço base do ticket", async () => {
    const client = await createUser({
      name: "Client Base Delete",
      email: "client_ticket_base_delete@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Base Delete",
      email: "technical_ticket_base_delete@email.com",
      role: "technical",
    });

    const baseService = await createService({
      name: "Base Delete",
      amount: 120,
    });

    const ticket = await createTicket({
      title: "Ticket Base Delete",
      description: "Descrição para testar bloqueio de exclusão de serviço base",
      clientId: client.id,
      technicalId: technical.id,
    });

    const baseTicketService = await createTicketService({
      ticketId: ticket.id,
      serviceId: baseService.id,
      amount: baseService.amount,
    });

    const token = await authenticate("technical_ticket_base_delete@email.com");

    const response = await request(app)
      .delete(`/tickets/${ticket.id}/services/${baseTicketService.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "O serviço base do ticket não pode ser deletado",
    );
  });

  it("deve impedir exclusão de serviço quando ticket está fechado", async () => {
    const client = await createUser({
      name: "Client Closed Delete",
      email: "client_ticket_closed_delete@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Closed Delete",
      email: "technical_ticket_closed_delete@email.com",
      role: "technical",
    });

    const baseService = await createService({
      name: "Base Closed Delete",
      amount: 130,
    });

    const extraService = await createService({
      name: "Extra Closed Delete",
      amount: 40,
    });

    const ticket = await createTicket({
      title: "Ticket Closed Delete",
      description: "Descrição para testar ticket fechado ao excluir serviço",
      clientId: client.id,
      technicalId: technical.id,
      status: "closed",
    });

    await createTicketService({
      ticketId: ticket.id,
      serviceId: baseService.id,
      amount: baseService.amount,
    });

    const extraTicketService = await createTicketService({
      ticketId: ticket.id,
      serviceId: extraService.id,
      amount: extraService.amount,
    });

    const token = await authenticate(
      "technical_ticket_closed_delete@email.com",
    );

    const response = await request(app)
      .delete(`/tickets/${ticket.id}/services/${extraTicketService.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Não é possível excluir serviços de um ticket fechado",
    );
  });

  it("deve deletar serviço adicional do ticket com usuário technical", async () => {
    const client = await createUser({
      name: "Client Delete Service",
      email: "client_ticket_delete_service@email.com",
      role: "client",
    });

    const technical = await createUser({
      name: "Technical Delete Service",
      email: "technical_ticket_delete_service@email.com",
      role: "technical",
    });

    const baseService = await createService({
      name: "Base Delete Service",
      amount: 140,
    });

    const extraService = await createService({
      name: "Extra Delete Service",
      amount: 30,
    });

    const ticket = await createTicket({
      title: "Ticket Delete Service",
      description: "Descrição para deletar serviço adicional do ticket",
      clientId: client.id,
      technicalId: technical.id,
    });

    await createTicketService({
      ticketId: ticket.id,
      serviceId: baseService.id,
      amount: baseService.amount,
    });

    const extraTicketService = await createTicketService({
      ticketId: ticket.id,
      serviceId: extraService.id,
      amount: extraService.amount,
    });

    const token = await authenticate(
      "technical_ticket_delete_service@email.com",
    );

    const response = await request(app)
      .delete(`/tickets/${ticket.id}/services/${extraTicketService.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    const ticketAfterDelete = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: { ticketServices: true },
    });

    expect(response.status).toBe(200);
    expect(ticketAfterDelete?.ticketServices).toHaveLength(1);
    expect(ticketAfterDelete?.ticketServices[0].serviceId).toBe(baseService.id);
  });
});
