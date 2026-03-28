import { Server } from "socket.io";
import { socketAuth } from "./auth";
import { registerSocketEvents } from "./events";
import { setGlobalIO } from "./global";

// For Vercel deployment
export const setupSocketIO = (io: Server) => {
  setGlobalIO(io); // Store io globally for controllers
  io.use(socketAuth);
  io.on("connection", socket => {
    socket.data.io = io; // Attach io to socket for access in handlers
    registerSocketEvents(socket, io);
  });
};
