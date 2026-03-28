import jwt from "jsonwebtoken";

export const socketAuth = (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    socket.userId = decoded.id;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};
