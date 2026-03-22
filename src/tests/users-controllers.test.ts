import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

const defaultPasswordHash =
  "$2b$08$4dVmvVbQSMhAwLrS49DWb.p3sNZNVYP4jksvneGv4HT5tm9aprESm";

describe("UsersController", () => {
  const createUser = async ({
    name,
    email,
    role = "client",
  }: {
    name: string;
    email: string;
    role?: "admin" | "technical" | "client";
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

  const authenticate = async (email: string, password = "123456") => {
    const response = await request(app).post("/sessions").send({
      email,
      password,
    });

    return response.body.token as string;
  };

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  it("deve criar um usuário cliente", async () => {
    const response = await request(app).post("/users").send({
      name: "User Create",
      email: "user_create@email.com",
      password: "123456",
    });

    const createdUser = await prisma.user.findUnique({
      where: { email: "user_create@email.com" },
    });

    expect(response.status).toBe(201);
    expect(createdUser?.role).toBe("client");
  });

  it("deve falhar ao criar um usuário cliente com email já existente", async () => {
    await request(app).post("/users").send({
      name: "User Duplicate 1",
      email: "user_duplicate@email.com",
      password: "123456",
    });

    const response = await request(app).post("/users").send({
      name: "User Duplicate 2",
      email: "user_duplicate@email.com",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email já cadastrado");
  });

  it("deve exigir token para obter o usuário autenticado", async () => {
    const response = await request(app).get("/users").send();

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token é obrigatório");
  });

  it("deve obter um usuário com o token de acesso", async () => {
    await createUser({
      name: "User Show",
      email: "user_show@email.com",
    });

    const token = await authenticate("user_show@email.com");

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("user_show@email.com");
    expect(response.body.role).toBe("client");
    expect(response.body).not.toHaveProperty("password");
  });

  it("deve atualizar nome e email do usuário autenticado", async () => {
    const user = await createUser({
      name: "User Update",
      email: "user_update@email.com",
    });

    const token = await authenticate("user_update@email.com");

    const response = await request(app)
      .patch("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "User Updated",
        email: "user_updated@email.com",
      });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(response.status).toBe(200);
    expect(updatedUser?.name).toBe("User Updated");
    expect(updatedUser?.email).toBe("user_updated@email.com");
  });

  it("deve alterar a senha do usuário autenticado", async () => {
    await createUser({
      name: "User Change Password",
      email: "user_change_password@email.com",
    });

    const token = await authenticate("user_change_password@email.com");

    const response = await request(app)
      .patch("/users/changePassword")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "123456",
        newPassword: "654321",
      });

    const oldSessionResponse = await request(app).post("/sessions").send({
      email: "user_change_password@email.com",
      password: "123456",
    });

    const newSessionResponse = await request(app).post("/sessions").send({
      email: "user_change_password@email.com",
      password: "654321",
    });

    expect(response.status).toBe(200);
    expect(oldSessionResponse.status).toBe(401);
    expect(newSessionResponse.status).toBe(200);
    expect(newSessionResponse.body.token).toEqual(expect.any(String));
  });

  it("deve desativar o usuário autenticado", async () => {
    const user = await createUser({
      name: "User Delete",
      email: "user_delete@email.com",
    });

    const token = await authenticate("user_delete@email.com");

    const response = await request(app)
      .delete("/users")
      .set("Authorization", `Bearer ${token}`)
      .send();

    const deletedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(response.status).toBe(200);
    expect(deletedUser?.status).toBe(false);
  });
});
