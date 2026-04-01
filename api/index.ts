import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "../src/config/swagger";
import connectDB from "../src/config/db";
import pusherRoutes from "../src/routes/pusher.routes";
import callRoutes from "../src/routes/call.routes";
import authRoutes from "../src/routes/auth.routes";
import chatRoutes from "../src/routes/chat.routes";
import messageRoutes from "../src/routes/message.routes";
import notificationRoutes from "../src/routes/notification.routes";

dotenv.config();

const app = express();

connectDB();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "*"
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000", "http://localhost:8080"],
  credentials: true,
}));
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

/* ---------- SWAGGER UI ---------- */
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
const JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
];

app.use(
  "/api-docs",
  swaggerUi.serve,
  (req: any, res: any) => {
    res.send(
      swaggerUi.generateHTML(specs, {
        customCssUrl: CSS_URL,
        customJs: JS_URLS,
        swaggerOptions: { persistAuthorization: true },
      })
    );
  }
);

/* ---------- ROOT ---------- */
app.get("/", (_req, res) => {
  res.status(200).json({ message: "API is running", docs: "/api-docs", health: "/health" });
});

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (_req, res) => {
  res.json({ status: "Server is running", timestamp: new Date(), environment: process.env.NODE_ENV || "development" });
});

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/pusher", pusherRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/calls", callRoutes);

/* ---------- 404 ---------- */
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ---------- ERROR HANDLER ---------- */
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message,
  });
});

export default app;

/* ---------- LOCAL DEV ---------- */
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
  });
}
