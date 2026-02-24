import { prisma } from "@/database/prisma";

export class ServicingService {
  async index() {
    return await prisma.service.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }
}
