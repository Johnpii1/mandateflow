import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import agentRoutes, {
  ownedAgentsRouter,
} from "./modules/agents/agent.routes.js";
import marketplaceRoutes from "./modules/marketplace/marketplace.routes.js";
import mandateRoutes from "./modules/mandates/mandate.routes.js";
import { AppError } from "./common/errors/AppError.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import userRoutes from "./modules/users/user.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/agents", agentRoutes);
app.use("/api/v1/users/me/agents", ownedAgentsRouter);
app.use("/api/v1/marketplace", marketplaceRoutes);
app.use("/api/v1/mandates", mandateRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/health", async (_request, response) => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection not established");
    }

    await db.command({ ping: 1 });

    response.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    console.error("Health check DB ping failed:", err);

    response.status(503).json({
      status: "unavailable",
      database: "disconnected",
    });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: "Not found" });
});

const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    console.error("Request failed.");
  }

  response.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

export default app;
