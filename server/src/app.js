import "dotenv/config";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import aiRoutes from "./routes/aiRoutes.js";
import aiModelsRouter from "./routes/aiModels.js";
import historyRoutes from "./routes/historyRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "250kb" }));

app.use(
  "/api/ai",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many AI requests. Please wait a minute and try again." },
  }),
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    provider: process.env.AI_PROVIDER || "mock",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/ai", aiModelsRouter);
app.use("/api/ai", aiRoutes);
app.use("/api/history", historyRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
