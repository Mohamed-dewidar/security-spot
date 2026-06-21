import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { NotFoundError } from "../errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof NotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Validation failed";
    res.status(400).json({ message });
    return;
  }

  next(err);
};
