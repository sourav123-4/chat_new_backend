import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "../src/config/swagger";
import connectDB from "../src/config/db";

import authRoutes from "../src/routes/auth.routes";
import chatRoutes from "../src/routes/chat.routes";
import messageRoutes from "../src/routes/message.routes";
import notificationRoutes from "../src/routes/notification.routes";

dotenv.config();

console.log("[Vercel] api/index.ts initializing");

const app = express();

// Connect to database
connectDB();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.vercel.app', 'https://your-frontend-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8000','http://localhost:8080'],
  credentials: true
}));
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

/* ---------- SWAGGER UI ---------- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCssUrl: '/api-docs/swagger-ui.css',
  customJs: '/api-docs/swagger-ui-bundle.js',
  customfavIcon: '/api-docs/favicon-32x32.png',
  customSiteTitle: 'API Docs',
}));

/* ---------- ROOT ROUTE ---------- */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running",
    docs: "/api-docs",
    health: "/health"
  });
});

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/* ---------- ROUTES ---------- */
console.log("[Vercel] Mounting auth routes to /api/auth");
app.use("/api/auth", authRoutes);
console.log("[Vercel] Mounting chats routes to /api/chats");
app.use("/api/chats", chatRoutes);
console.log("[Vercel] Mounting message routes to /api/messages");
app.use("/api/messages", messageRoutes);
console.log("[Vercel] Mounting notification routes to /api/notification");
app.use("/api/notification", notificationRoutes);

/* ---------- 404 HANDLER ---------- */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ---------- ERROR HANDLER ---------- */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// Export for Vercel
export default app;

// For local development
if (require.main === module) {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.vercel.app', 'https://your-frontend-domain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }
  });

  // Socket.IO setup
  import("../src/sockets").then(({ setupSocketIO }) => {
    setupSocketIO(io);
  });

  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/api-docs`);
  });
}