import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
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

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notification", notificationRoutes);

/* ---------- SOCKET AUTH + EVENTS ---------- */
import "./sockets"; // 👈 VERY IMPORTANT


server.listen(process.env.PORT || 8000, () =>
  console.log("🚀 Server started on port 8000")
);
