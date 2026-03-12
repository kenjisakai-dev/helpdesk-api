import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/app-error";

type ScaleCreateDTO = {
  user_id: number;
  scales_id: number[];
};

type IndexScaleUserDTO = {
  user_id: number;
};

export class ScaleService {
  async index() {
    return await prisma.scale.findMany({
      orderBy: { hour: "asc" },
    });
  }

  async createScaleUser({ user_id, scales_id }: ScaleCreateDTO) {
    const user = await prisma.user.findUnique({
      where: { id: user_id, status: true },
    });

    if (!user) throw new AppError("Usuário não encontrado", 404);

    await prisma.userScale.deleteMany({
      where: { userId: user_id },
    });

    if (user.role !== "technical") {
      throw new AppError(
        "Somente usuários técnicos são autorizados a ter escala",
        403,
      );
    }

    const scales = await prisma.scale.findMany({
      where: {
        id: {
          in: scales_id,
        },
      },
      select: { id: true },
    });

    const data = scales.map((scale) => ({
      userId: user_id,
      scaleId: scale.id,
    }));

    await prisma.userScale.createMany({
      data,
    });
  }

  async showScaleUsers({ user_id }: IndexScaleUserDTO) {
    return await prisma.userScale.findMany({
      where: { userId: user_id },
      include: { scale: true },
    });
  }
}
