import { io } from "../server";
import { socketAuth } from "./auth";
import { registerSocketEvents } from "./events";

io.use(socketAuth);

io.on("connection", socket => {
  registerSocketEvents(socket);
});
