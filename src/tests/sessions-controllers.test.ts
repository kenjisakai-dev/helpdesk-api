import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";

describe("SessionsController", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        name: "User Session 1",
        email: "user_session_1@email.com",
        role: "client",
        password:
          "$2b$08$4dVmvVbQSMhAwLrS49DWb.p3sNZNVYP4jksvneGv4HT5tm9aprESm",
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  it("deve autenticar e obter token de acesso", async () => {
    const resSession = await request(app).post("/sessions").send({
      email: "user_session_1@email.com",
      password: "123456",
    });

    expect(resSession.status).toBe(200);
    expect(resSession.body.token).toEqual(expect.any(String));
  });

  it("deve falhar autenticação com login inválido", async () => {
    const resSession = await request(app).post("/sessions").send({
      email: "user_session_1_invalid@email.com",
      password: "123456_invalid",
    });

    expect(resSession.status).toBe(401);
    expect(resSession.body.message).toBe("E-mail e/ou senha inválidos");
  });
});
