import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.models.js";

const port = process.env.PORT || 3001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5176",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1]; // fixed crash

    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication error"));
    }
    socket.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();

  console.log("A user connected:", socket.id);

  socket.join(socket.roomId);

  socket.on("project-message", (data) => {
    console.log("Received:", data);
    socket.broadcast.to(socket.roomId).emit("project-message", data);
  });

  socket.on("ping", (data) => {
    console.log("Ping received:", data);
    socket.emit("pong", "Hello from backend");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.leave(socket.roomId)
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
