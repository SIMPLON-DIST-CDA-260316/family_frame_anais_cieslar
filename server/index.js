import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());

app.get("/api/health", (req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
    console.log("client connecté", socket.id);
});

server.listen(3000, () => console.log("API sur http://localhost:3000"));
