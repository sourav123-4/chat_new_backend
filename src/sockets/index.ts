import { Server } from "socket.io";
import { socketAuth } from "./auth";
import { registerSocketEvents } from "./events";

// For Vercel deployment
export const setupSocketIO = (io: Server) => {
  io.use(socketAuth);
  io.on("connection", socket => {
    registerSocketEvents(socket);
  });
};

// For local development (legacy)
import { io } from "../server";
if (io) {
  setupSocketIO(io);
}
