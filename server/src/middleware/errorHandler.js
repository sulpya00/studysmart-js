import { ZodError } from "zod";

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Please check the submitted information.",
      issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }

  console.error(error);
  const status = error.statusCode || error.status || 500;
  return res.status(status).json({ message: error.message || "Unexpected server error." });
}
