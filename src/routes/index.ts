import { Router } from "express";
import { usersRoutes } from "@/routes/users-routes";
import { sessionsRoutes } from "@/routes/sessions-routes";
import { ticketsRouter } from "@/routes/tickets-routes";
import { servicingRouter } from "@/routes/servicings-routes";
import { uploadsRoutes } from "@/routes/uploads-routes";
import { scalesRoutes } from "@/routes/scales-routes";
import { technicalsRoutes } from "@/routes/technicals-routes";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const routes = Router();

routes.get("/ping", (req, res) => {
  return res.json({ message: "pong", now: new Date() });
});

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);

routes.use(ensureAuthenticated);
routes.use("/tickets", ticketsRouter);
routes.use("/servicings", servicingRouter);
routes.use("/uploads", uploadsRoutes);
routes.use("/scales", scalesRoutes);
routes.use("/technicals", technicalsRoutes);

export { routes };
