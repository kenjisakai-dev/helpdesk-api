import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

const defaultPasswordHash =
  "$2b$08$4dVmvVbQSMhAwLrS49DWb.p3sNZNVYP4jksvneGv4HT5tm9aprESm";

describe("ClientsController", () => {
  const createUser = async ({
    name,
    email,
    role,
  }: {
    name: string;
    email: string;
    role: "admin" | "client";
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

  const authenticate = async (email: string) => {
    const response = await request(app).post("/sessions").send({
      email,
      password: "123456",
    });

    return response.body.token as string;
  };

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  it("deve negar acesso para usuário sem perfil admin", async () => {
    await createUser({
      name: "Client Auth",
      email: "client_auth@email.com",
      role: "client",
    });

    const token = await authenticate("client_auth@email.com");

    const response = await request(app)
      .get("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Acesso negado");
  });

  it("deve listar clientes ativos sem expor a senha", async () => {
    await createUser({
      name: "Admin User",
      email: "admin_clients@email.com",
      role: "admin",
    });

    await createUser({
      name: "Client B",
      email: "client_b@email.com",
      role: "client",
    });

    await createUser({
      name: "Client A",
      email: "client_a@email.com",
      role: "client",
    });

    const token = await authenticate("admin_clients@email.com");

    const response = await request(app)
      .get("/clients")
      .set("Authorization", `Bearer ${token}`)
      .query({ page: 1, limit: 10 })
      .send();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].name).toBe("Client A");
    expect(response.body.data[1].name).toBe("Client B");
    expect(response.body.data[0]).not.toHaveProperty("password");
    expect(response.body.data[1]).not.toHaveProperty("password");
    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      totalPages: 1,
      totalItems: 2,
    });
  });

  it("deve obter um cliente específico sem expor a senha", async () => {
    await createUser({
      name: "Admin User",
      email: "admin_show_client@email.com",
      role: "admin",
    });

    const client = await createUser({
      name: "Client Show",
      email: "client_show@email.com",
      role: "client",
    });

    const token = await authenticate("admin_show_client@email.com");

    const response = await request(app)
      .get(`/clients/${client.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(client.id);
    expect(response.body.email).toBe("client_show@email.com");
    expect(response.body).not.toHaveProperty("password");
  });

  it("deve atualizar os dados de um cliente", async () => {
    await createUser({
      name: "Admin User",
      email: "admin_update_client@email.com",
      role: "admin",
    });

    const client = await createUser({
      name: "Client Update",
      email: "client_update@email.com",
      role: "client",
    });

    const token = await authenticate("admin_update_client@email.com");

    const response = await request(app)
      .patch("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: client.id,
        name: "Client Updated",
        email: "client_updated@email.com",
      });

    const updatedClient = await prisma.user.findUnique({
      where: { id: client.id },
    });

    expect(response.status).toBe(200);
    expect(updatedClient?.name).toBe("Client Updated");
    expect(updatedClient?.email).toBe("client_updated@email.com");
  });

  it("deve desativar um cliente", async () => {
    await createUser({
      name: "Admin User",
      email: "admin_delete_client@email.com",
      role: "admin",
    });

    const client = await createUser({
      name: "Client Delete",
      email: "client_delete@email.com",
      role: "client",
    });

    const token = await authenticate("admin_delete_client@email.com");

    const response = await request(app)
      .delete(`/clients/${client.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    const deletedClient = await prisma.user.findUnique({
      where: { id: client.id },
    });

    expect(response.status).toBe(200);
    expect(deletedClient?.status).toBe(false);
  });
});
