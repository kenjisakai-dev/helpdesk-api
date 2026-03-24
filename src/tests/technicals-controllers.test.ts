import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

const defaultPasswordHash =
  "$2b$08$4dVmvVbQSMhAwLrS49DWb.p3sNZNVYP4jksvneGv4HT5tm9aprESm";

describe("TechnicalsController", () => {
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

  const createScale = async (hour: number) => {
    return prisma.scale.create({
      data: { hour },
    });
  };

  const createTechnicalWithScales = async ({
    name,
    email,
    scaleIds,
  }: {
    name: string;
    email: string;
    scaleIds: number[];
  }) => {
    const technical = await createUser({
      name,
      email,
      role: "technical",
    });

    await prisma.userScale.createMany({
      data: scaleIds.map((scaleId) => ({
        userId: technical.id,
        scaleId,
      })),
    });

    return technical;
  };

  const authenticate = async (email: string) => {
    const response = await request(app).post("/sessions").send({
      email,
      password: "123456",
    });

    return response.body.token as string;
  };

  beforeEach(async () => {
    await prisma.userScale.deleteMany();
    await prisma.user.deleteMany();
    await prisma.scale.deleteMany();
  });

  afterAll(async () => {
    await prisma.userScale.deleteMany();
    await prisma.user.deleteMany();
    await prisma.scale.deleteMany();
  });

  it("deve negar acesso para usuário sem perfil admin ou technical", async () => {
    await createUser({
      name: "Client Auth",
      email: "client_auth_technical@email.com",
      role: "client",
    });

    const scale = await createScale(8);
    const technical = await createTechnicalWithScales({
      name: "Technical Target",
      email: "technical_target@email.com",
      scaleIds: [scale.id],
    });

    const token = await authenticate("client_auth_technical@email.com");

    const response = await request(app)
      .get(`/technicals/${technical.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve negar listagem para usuário technical", async () => {
    await createUser({
      name: "Technical Auth",
      email: "technical_auth@email.com",
      role: "technical",
    });

    const token = await authenticate("technical_auth@email.com");

    const response = await request(app)
      .get("/technicals")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve criar técnico com escalas", async () => {
    await createUser({
      name: "Admin User",
      email: "admin_create_technical@email.com",
      role: "admin",
    });

    const scaleA = await createScale(9);
    const scaleB = await createScale(10);

    const token = await authenticate("admin_create_technical@email.com");

    const response = await request(app)
      .post("/technicals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Technical Create",
        email: "technical_create@email.com",
        password: "123456",
        scales_id: [scaleA.id, scaleB.id],
      });

    const createdTechnical = await prisma.user.findUnique({
      where: { email: "technical_create@email.com" },
      include: { userScales: true },
    });

    expect(response.status).toBe(201);
    expect(createdTechnical?.role).toBe("technical");
    expect(createdTechnical?.password).not.toBe("123456");
    expect(createdTechnical?.userScales).toHaveLength(2);
  });

  it("deve listar técnicos ativos sem expor a senha", async () => {
    await createUser({
      name: "Admin User",
      email: "admin_index_technical@email.com",
      role: "admin",
    });

    const scaleA = await createScale(11);
    const scaleB = await createScale(12);

    await createTechnicalWithScales({
      name: "Technical B",
      email: "technical_b@email.com",
      scaleIds: [scaleA.id],
    });

    await createTechnicalWithScales({
      name: "Technical A",
      email: "technical_a@email.com",
      scaleIds: [scaleB.id],
    });

    const token = await authenticate("admin_index_technical@email.com");

    const response = await request(app)
      .get("/technicals")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10 })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].name).toBe("Technical A");
    expect(response.body.data[1].name).toBe("Technical B");
    expect(response.body.data[0]).not.toHaveProperty("password");
    expect(response.body.data[1]).not.toHaveProperty("password");
    expect(response.body.data[0].userScales).toHaveLength(1);
    expect(response.body.data[1].userScales).toHaveLength(1);
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalPages: 1,
      totalItems: 2,
    });
  });

  it("deve negar quando technical tenta ver outro técnico", async () => {
    await createUser({
      name: "Technical Auth",
      email: "technical_show_auth@email.com",
      role: "technical",
    });

    const scale = await createScale(13);
    const technical = await createTechnicalWithScales({
      name: "Technical Show",
      email: "technical_show@email.com",
      scaleIds: [scale.id],
    });

    const token = await authenticate("technical_show_auth@email.com");

    const response = await request(app)
      .get(`/technicals/${technical.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve permitir que technical veja apenas os próprios dados", async () => {
    const scale = await createScale(17);
    const technical = await createTechnicalWithScales({
      name: "Technical Self",
      email: "technical_self@email.com",
      scaleIds: [scale.id],
    });

    const token = await authenticate("technical_self@email.com");

    const response = await request(app)
      .get(`/technicals/${technical.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(technical.id);
    expect(response.body.email).toBe("technical_self@email.com");
    expect(response.body).not.toHaveProperty("password");
    expect(response.body.userScales).toHaveLength(1);
  });

  it("deve atualizar técnico e substituir escalas", async () => {
    await createUser({
      name: "Admin User",
      email: "admin_update_technical@email.com",
      role: "admin",
    });

    const oldScale = await createScale(14);
    const newScaleA = await createScale(15);
    const newScaleB = await createScale(16);

    const technical = await createTechnicalWithScales({
      name: "Technical Update",
      email: "technical_update@email.com",
      scaleIds: [oldScale.id],
    });

    const token = await authenticate("admin_update_technical@email.com");

    const response = await request(app)
      .patch("/technicals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: technical.id,
        name: "Technical Updated",
        email: "technical_updated@email.com",
        scales_id: [newScaleA.id, newScaleB.id],
      });

    const updatedTechnical = await prisma.user.findUnique({
      where: { id: technical.id },
      include: {
        userScales: {
          select: { scaleId: true },
        },
      },
    });

    expect(response.status).toBe(200);
    expect(updatedTechnical?.name).toBe("Technical Updated");
    expect(updatedTechnical?.email).toBe("technical_updated@email.com");
    expect(updatedTechnical?.userScales).toHaveLength(2);
  });
});
