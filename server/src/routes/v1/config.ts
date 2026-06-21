import { Router, type IRouter } from "express";
import { getBundleConfig } from "../../db/catalog.js";
import { getDb } from "../../db/index.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const configRouter: IRouter = Router();

configRouter.get(
  "/config",
  asyncHandler(async (_req, res) => {
    const catalog = getBundleConfig(getDb());
    res.json(catalog);
  }),
);
