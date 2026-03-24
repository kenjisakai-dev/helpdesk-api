import { prisma } from "@/database/prisma";

export class ScaleService {
  async index() {
    return await prisma.scale.findMany({
      orderBy: { hour: "asc" },
    });
  }
}
