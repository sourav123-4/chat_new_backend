import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import connectDB from "./config/db";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import notificationRoutes from "./routes/notification.routes";
import pusherRoutes from "./routes/pusher.routes";
import callRoutes from "./routes/call.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));

connectDB();

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
const JS_URLS = [
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
];

app.use(
  "/api-docs",
  swaggerUi.serve,
  (req: any, res: any) => {
    res.send(
      swaggerUi.generateHTML(specs, {
        customCssUrl: CSS_URL,
        customJs: JS_URLS,
        swaggerOptions: { persistAuthorization: true },
      })
    );
  }
);

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/pusher", pusherRoutes);
app.use("/api/calls", callRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

app.listen(process.env.PORT || 8000, () =>
  console.log("🚀 Server started on port 8000")
);
