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
/* ---------- SWAGGER UI ---------- */
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
const JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"
];

app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", (req, res) => {
  res.send(
    swaggerUi.generateHTML(specs, {
      customCssUrl: CSS_URL,
      customJs: JS_URLS,
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
});

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

