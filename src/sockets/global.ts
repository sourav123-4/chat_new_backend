import { Server } from "socket.io";

let globalIO: Server | null = null;

export const setGlobalIO = (io: Server) => {
  globalIO = io;
};

export const getGlobalIO = (): Server => {
  if (!globalIO) {
    throw new Error("Socket.IO not initialized. Make sure setupSocketIO is called first.");
  }
  return globalIO;
};
