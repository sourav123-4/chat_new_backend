import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import connectDB from "./config/db";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import notificationRoutes from "./routes/notification.routes";

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ---------- SOCKET.IO ---------- */
export const io = new Server(server, {
  cors: { origin: "*" },
});

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

/* ---------- DB ---------- */
connectDB();

/* ---------- SWAGGER UI ---------- */

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCssUrl: CSS_URL,
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
  ]
}));

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notification", notificationRoutes);

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

/* ---------- SOCKET AUTH + EVENTS ---------- */
import "./sockets"; // 👈 VERY IMPORTANT


server.listen(process.env.PORT || 8000, () =>
  console.log("🚀 Server started on port 8000")
);

