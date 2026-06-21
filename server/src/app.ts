import cors from "cors";
import express from "express";
import { v1Router } from "./routes/v1/index.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/v1", v1Router);

  return app;
}
