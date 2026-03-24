import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

const defaultPasswordHash =
  "$2b$08$4dVmvVbQSMhAwLrS49DWb.p3sNZNVYP4jksvneGv4HT5tm9aprESm";

describe("ServicingsController", () => {
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

  const authenticate = async (email: string) => {
    const response = await request(app).post("/sessions").send({
      email,
      password: "123456",
    });

    return response.body.token as string;
  };

  beforeEach(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.ticketService.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
  });

  it("deve negar criação de serviço para usuário sem perfil admin", async () => {
    await createUser({
      name: "Client Service",
      email: "client_service@email.com",
      role: "client",
    });

    const token = await authenticate("client_service@email.com");

    const response = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Instalação",
        amount: 120,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve criar um serviço com usuário admin", async () => {
    await createUser({
      name: "Admin Service",
      email: "admin_service_create@email.com",
      role: "admin",
    });

    const token = await authenticate("admin_service_create@email.com");

    const response = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Visita Técnica",
        amount: 180,
      });

    const createdService = await prisma.service.findFirst({
      where: { name: "Visita Técnica" },
    });

    expect(response.status).toBe(201);
    expect(createdService?.amount).toBe(180);
    expect(createdService?.status).toBe(true);
  });

  it("deve falhar ao criar serviço com nome já existente", async () => {
    await createUser({
      name: "Admin Service",
      email: "admin_service_duplicate@email.com",
      role: "admin",
    });

    await createService({
      name: "Formatação",
      amount: 90,
    });

    const token = await authenticate("admin_service_duplicate@email.com");

    const response = await request(app)
      .post("/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Formatação",
        amount: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Serviço já existente");
  });

  it("deve listar serviços para usuário autenticado", async () => {
    await createUser({
      name: "Client Service",
      email: "client_service_index@email.com",
      role: "client",
    });

    await createService({
      name: "Backup",
      amount: 70,
      status: true,
    });

    await createService({
      name: "Antivírus",
      amount: 50,
      status: false,
    });

    const token = await authenticate("client_service_index@email.com");

    const response = await request(app)
      .get("/services")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10 })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].name).toBe("Antivírus");
    expect(response.body.data[1].name).toBe("Backup");
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalPages: 1,
      totalItems: 2,
    });
  });

  it("deve filtrar listagem por status", async () => {
    await createUser({
      name: "Technical Service",
      email: "technical_service_filter@email.com",
      role: "technical",
    });

    await createService({
      name: "Rede",
      amount: 200,
      status: true,
    });

    await createService({
      name: "Hardware",
      amount: 250,
      status: false,
    });

    const token = await authenticate("technical_service_filter@email.com");

    const response = await request(app)
      .get("/services")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10, status: false })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Hardware");
    expect(response.body.data[0].status).toBe(false);
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalPages: 1,
      totalItems: 1,
    });
  });

  it("deve negar visualização de serviço por id para usuário sem perfil admin", async () => {
    await createUser({
      name: "Client Service",
      email: "client_service_show@email.com",
      role: "client",
    });

    const service = await createService({
      name: "Chamado Prioritário",
      amount: 300,
    });

    const token = await authenticate("client_service_show@email.com");

    const response = await request(app)
      .get(`/services/${service.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve obter serviço por id com usuário admin", async () => {
    await createUser({
      name: "Admin Service",
      email: "admin_service_show@email.com",
      role: "admin",
    });

    const service = await createService({
      name: "Suporte Avançado",
      amount: 400,
    });

    const token = await authenticate("admin_service_show@email.com");

    const response = await request(app)
      .get(`/services/${service.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(service.id);
    expect(response.body.name).toBe("Suporte Avançado");
    expect(response.body.amount).toBe(400);
  });

  it("deve atualizar serviço com usuário admin", async () => {
    await createUser({
      name: "Admin Service",
      email: "admin_service_update@email.com",
      role: "admin",
    });

    const service = await createService({
      name: "Manutenção",
      amount: 150,
      status: true,
    });

    const token = await authenticate("admin_service_update@email.com");

    const response = await request(app)
      .patch("/services")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: service.id,
        name: "Manutenção Premium",
        amount: 220,
        status: false,
      });

    const updatedService = await prisma.service.findUnique({
      where: { id: service.id },
    });

    expect(response.status).toBe(200);
    expect(updatedService?.name).toBe("Manutenção Premium");
    expect(updatedService?.amount).toBe(220);
    expect(updatedService?.status).toBe(false);
  });
});
