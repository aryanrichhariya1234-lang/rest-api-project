import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

import swaggerSpec from "./config/swagger.js";
import v1Routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS - allow the Next.js frontend origin
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://rest-api-project-m4jspsim0-aryans-projects-20e2dbbb.vercel.app",
    credentials: true,
  })
);

// Body parsing with size limit
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting (applies to all routes, tighter for auth in its own limiter below)
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use("/api", globalLimiter);

// Stricter limiter specifically for auth endpoints to slow brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth attempts, please try again later",
  },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Versioned API routes
app.use("/api/v1", v1Routes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

export default app;
