import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/database/prisma";
import uploadConfig from "@/configs/multer-config";

const defaultPasswordHash =
  "$2b$08$4dVmvVbQSMhAwLrS49DWb.p3sNZNVYP4jksvneGv4HT5tm9aprESm";

describe("UploadsController", () => {
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

  const authenticate = async (email: string) => {
    const response = await request(app).post("/sessions").send({
      email,
      password: "123456",
    });

    return response.body.token as string;
  };

  const uploadImage = async ({
    token,
    filename = "avatar.png",
    contentType = "image/png",
    content = "fake-image-content",
  }: {
    token: string;
    filename?: string;
    contentType?: string;
    content?: string;
  }) => {
    return request(app)
      .post("/uploads")
      .set("Authorization", `Bearer ${token}`)
      .attach("profile", Buffer.from(content), {
        filename,
        contentType,
      });
  };

  beforeEach(async () => {
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();

    await fs.promises.rm(uploadConfig.TMP_FOLDER, {
      recursive: true,
      force: true,
    });
    await fs.promises.rm(uploadConfig.UPLOADS_FOLDER, {
      recursive: true,
      force: true,
    });

    await fs.promises.mkdir(uploadConfig.TMP_FOLDER, { recursive: true });
    await fs.promises.mkdir(uploadConfig.UPLOADS_FOLDER, { recursive: true });
  });

  afterAll(async () => {
    // await prisma.userProfile.deleteMany();
    // await prisma.user.deleteMany();
    // await fs.promises.rm(uploadConfig.TMP_FOLDER, {
    //   recursive: true,
    //   force: true,
    // });
    // await fs.promises.rm(uploadConfig.UPLOADS_FOLDER, {
    //   recursive: true,
    //   force: true,
    // });
  });

  it("deve exigir autenticação no upload de avatar", async () => {
    const response = await request(app)
      .post("/uploads")
      .attach("profile", Buffer.from("fake"), {
        filename: "avatar.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token é obrigatório");
  });

  it("deve fazer upload de avatar e salvar perfil", async () => {
    const user = await createUser({
      name: "User Upload",
      email: "user_upload@email.com",
      role: "client",
    });

    const token = await authenticate("user_upload@email.com");

    const response = await uploadImage({ token });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const uploadedPath = path.resolve(
      uploadConfig.UPLOADS_FOLDER,
      response.body.filename,
    );

    expect(response.status).toBe(201);
    expect(response.body.filename).toEqual(expect.any(String));
    expect(profile?.filename).toBe(response.body.filename);
    expect(fs.existsSync(uploadedPath)).toBe(true);
  });

  it("deve substituir avatar anterior ao enviar novo arquivo", async () => {
    const user = await createUser({
      name: "User Replace Upload",
      email: "user_replace_upload@email.com",
      role: "client",
    });

    const token = await authenticate("user_replace_upload@email.com");

    const firstUpload = await uploadImage({
      token,
      filename: "first.png",
      content: "first-content",
    });

    const secondUpload = await uploadImage({
      token,
      filename: "second.png",
      content: "second-content",
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const firstPath = path.resolve(
      uploadConfig.UPLOADS_FOLDER,
      firstUpload.body.filename,
    );

    const secondPath = path.resolve(
      uploadConfig.UPLOADS_FOLDER,
      secondUpload.body.filename,
    );

    expect(firstUpload.status).toBe(201);
    expect(secondUpload.status).toBe(201);
    expect(profile?.filename).toBe(secondUpload.body.filename);
    expect(fs.existsSync(firstPath)).toBe(false);
    expect(fs.existsSync(secondPath)).toBe(true);
  });

  it("deve rejeitar upload com formato inválido", async () => {
    await createUser({
      name: "User Invalid Upload",
      email: "user_invalid_upload@email.com",
      role: "client",
    });

    const token = await authenticate("user_invalid_upload@email.com");

    const response = await uploadImage({
      token,
      filename: "file.txt",
      contentType: "text/plain",
      content: "not-an-image",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Formato de arquivo inválido");
  });

  it("deve remover avatar do usuário", async () => {
    const user = await createUser({
      name: "User Delete Upload",
      email: "user_delete_upload@email.com",
      role: "client",
    });

    const token = await authenticate("user_delete_upload@email.com");

    const uploadResponse = await uploadImage({ token });

    const uploadedPath = path.resolve(
      uploadConfig.UPLOADS_FOLDER,
      uploadResponse.body.filename,
    );

    const deleteResponse = await request(app)
      .delete("/uploads")
      .set("Authorization", `Bearer ${token}`)
      .send();

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    expect(deleteResponse.status).toBe(200);
    expect(fs.existsSync(uploadedPath)).toBe(false);
  });
});
