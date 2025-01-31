const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

// ✅ Properly Handle WebSocket Upgrade Requests
server.on("upgrade", (request, socket, head) => {
  console.log("🔄 WebSocket upgrade request received");
  socket.on("error", (err) => console.error("❌ WebSocket upgrade error:", err));
});

// ✅ Serve a Simple Web Page to Prevent "Cannot GET /"
app.get("/", (req, res) => {
  res.send("<h1>Server is Running. WebSockets should be working.</h1>");
});

// ✅ Ensure WebSockets Are Properly Handled
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("draw", (data) => {
    console.log("Received drawing data:", data);
    socket.broadcast.emit("draw", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Start Server on Port 4000, Listening on All Interfaces
server.listen(4000, "0.0.0.0", () => console.log("🚀 Server running on port 4000 (bound to all interfaces)"));
