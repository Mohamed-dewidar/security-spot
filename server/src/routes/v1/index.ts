import { Router, type IRouter } from "express";
import { configRouter } from "./config.js";
import { configurationsRouter } from "./configurations.js";
import { healthRouter } from "./health.js";

export const v1Router: IRouter = Router();

v1Router.use(healthRouter);
v1Router.use(configRouter);
v1Router.use(configurationsRouter);
