import { Router } from "express";
import { usersRoutes } from "@/routes/users-routes";

const routes = Router();

routes.get("/ping", (req, res) => {
  return res.json({ message: "pong", now: new Date() });
});

routes.use("/users", usersRoutes);

export { routes };
