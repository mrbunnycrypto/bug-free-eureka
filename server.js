const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

let players = {};
let obstacles = [{ x: 400, y: 100 }]; // Example obstacle

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);
    
    players[socket.id] = { x: 400, y: 500 };
    io.emit("updatePlayers", players);
    io.emit("updateObstacles", obstacles);

    socket.on("playerMove", (data) => {
        if (players[socket.id]) {
            players[socket.id] = data;
            io.emit("updatePlayers", players);
        }
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

// Move obstacles down
setInterval(() => {
    obstacles.forEach((obstacle) => obstacle.y += 5);
    io.emit("updateObstacles", obstacles);
}, 100);

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
