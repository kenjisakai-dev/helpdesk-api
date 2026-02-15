import express from "express";

const app = express();
app.use(express.json());

app.get("/ping", (req, res) => {
  return res.json({ message: "pong", now: new Date() });
});

export { app };
