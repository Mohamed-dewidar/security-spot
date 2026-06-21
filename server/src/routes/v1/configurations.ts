import { Router, type IRouter } from "express";
import { getDb } from "../../db/index.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import {
  createConfigurationSchema,
  patchConfigurationSchema,
} from "../../schemas/configuration.js";
import {
  createConfiguration,
  getConfiguration,
  patchConfiguration,
  saveConfiguration,
} from "../../services/configurationService.js";
import {
  checkoutConfiguration,
  quoteConfiguration,
} from "../../services/quoteService.js";

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const configurationsRouter: IRouter = Router();

configurationsRouter.post(
  "/configurations",
  asyncHandler(async (req, res) => {
    const body = createConfigurationSchema.parse(req.body);
    const config = createConfiguration(getDb(), body);
    res.status(201).json(config);
  }),
);

configurationsRouter.get(
  "/configurations/:id",
  asyncHandler(async (req, res) => {
    const config = getConfiguration(getDb(), routeParam(req.params.id));
    res.json(config);
  }),
);

configurationsRouter.patch(
  "/configurations/:id",
  asyncHandler(async (req, res) => {
    const body = patchConfigurationSchema.parse(req.body);
    const config = patchConfiguration(getDb(), routeParam(req.params.id), body);
    res.json(config);
  }),
);

configurationsRouter.post(
  "/configurations/:id/save",
  asyncHandler(async (req, res) => {
    const config = saveConfiguration(getDb(), routeParam(req.params.id));
    res.json(config);
  }),
);

configurationsRouter.post(
  "/configurations/:id/quote",
  asyncHandler(async (req, res) => {
    const quote = quoteConfiguration(getDb(), routeParam(req.params.id));
    res.json(quote);
  }),
);

configurationsRouter.post(
  "/configurations/:id/checkout",
  asyncHandler(async (req, res) => {
    const result = checkoutConfiguration(getDb(), routeParam(req.params.id));
    res.json(result);
  }),
);
