import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import connectDB from "./config/db.ts";
import authRoutes from './routes/auth.routes.ts';
import chatRoutes from './routes/chat.routes.ts';
import messageRoutes from './routes/message.routes.ts';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json({ strict: false }))
app.use(express.urlencoded())


connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// io.on("connection", (socket) => {
//   console.log("User Connected:", socket.id);

//   socket.on("send-message", (data) => {
//     io.emit("receive-message", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

server.listen(process.env.PORT || 8000, () => console.log("Server started on port 8000"));
