import cors from "cors";
import express, { type Express } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { v1Router } from "./routes/v1/index.js";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/v1", v1Router);
  app.use(errorHandler);

  return app;
}
