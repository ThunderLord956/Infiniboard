const express = require("express");
const { createServer } = require("http");
const WebSocket = require("ws");

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 4000;
const users = new Map(); // Stores users and their assigned colors
const drawingData = [];  // Stores drawing history for persistence

// Function to generate a random color
function getRandomColor() {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

wss.on("connection", function connection(ws) {
    console.log("🖌️ A user connected");

    // Assign a unique color to the new user
    const userColor = getRandomColor();
    users.set(ws, userColor);

    // Send existing drawing data to the new user
    ws.send(JSON.stringify({ type: "init", drawingData }));

    ws.on("message", function incoming(data) {
        try {
            const message = JSON.parse(data);

            if (["start", "draw", "end"].includes(message.type)) {
                // Attach the user’s color to the drawing message
                message.color = users.get(ws);

                // Store the drawing data for persistence
                drawingData.push(message);

                // Broadcast to all clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(message));
                    }
                });
            }
        } catch (error) {
            console.error("❌ Error parsing message:", error);
        }
    });

    ws.on("close", () => {
        console.log("❌ A user disconnected");
        users.delete(ws); // Remove user on disconnect
    });
});

// Serve the frontend
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
