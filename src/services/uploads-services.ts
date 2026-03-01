import { z, ZodError } from "zod";
import { DiskStorage } from "@/providers/disk-storage";
import uploadConfig from "@/configs/multer-config";
import { AppError } from "@/utils/app-error";
import { prisma } from "@/database/prisma";

type UploadFile = {
  user_id: number;
  objFile: Express.Multer.File | undefined;
};

export class UploadService {
  constructor(private diskStorage: DiskStorage) {}

  create = async ({ user_id, objFile }: UploadFile) => {
    const fileSchema = z.object({
      filename: z.string().trim().min(1, "filename é obrigatório"),
      mimetype: z
        .string()
        .refine(
          (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
          `Formato de arquivo inválido. Formatos permitidos: ${uploadConfig.ACCEPTED_IMAGE_TYPES}`,
        ),
      size: z
        .number("size é obrigatório")
        .positive("size deve ser um número positivo")
        .refine(
          (size) => size <= uploadConfig.MAX_FILE_SIZE,
          `Arquivo excede o tamanho máximo de ${uploadConfig.MAX_SIZE}MB`,
        ),
    });

    try {
      const file = fileSchema.parse(objFile);
      const filename = await this.diskStorage.saveFile(file.filename);

      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: user_id },
      });

      if (existingProfile) {
        await this.diskStorage.deleteFile(existingProfile.filename, "uploads");
      }

      await prisma.userProfile.upsert({
        where: { userId: user_id },
        update: { filename },
        create: {
          filename,
          userId: user_id,
        },
      });

      return filename;
    } catch (err) {
      if (err instanceof ZodError) {
        if (objFile) {
          await this.diskStorage.deleteFile(objFile.filename, "tmp");
        }

        throw new AppError(err.issues[0].message);
      }

      throw err;
    }
  };

  delete = async ({ user_id }: { user_id: number }) => {
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user_id },
    });

    if (!userProfile) return;

    await prisma.userProfile.delete({
      where: { userId: user_id },
    });

    await this.diskStorage.deleteFile(userProfile.filename, "uploads");
  };
}
