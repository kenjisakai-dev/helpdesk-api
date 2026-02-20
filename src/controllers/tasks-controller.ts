import { Request, Response } from "express";
import { z } from "zod";
import { TaskService } from "@/services/tasks-services";

export class TaskController {
  constructor(private taskService: TaskService) {}

  create = async (req: Request, res: Response) => {
    const bodySchema = z.object({
      title: z.string().trim().min(1, "O título é obrigatório"),
      description: z.string().trim().min(10, "A descrição é obrigatória"),
      service_id: z.number("O ID do serviço é obrigatório"),
    });

    const { title, description, service_id } = bodySchema.parse(req.body);
    const client_id = req.user?.user_id;

    await this.taskService.create({
      title,
      description,
      service_id,
      client_id,
    });

    return res.status(201).json();
  };
}
