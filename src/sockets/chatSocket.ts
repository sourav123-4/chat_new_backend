export const chatSocket = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
