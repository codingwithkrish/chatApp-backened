import { Server } from 'socket.io'
import http from 'http';
import express from 'express';
const app = express();
const server = http.createServer(app);
const io = new Server(server,);
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}


const userSocketMap = {};
io.on('connection', (socket) => {
    console.log("a user connected ", socket.id);
    const userId = socket.handshake.query.userId;
    console.log(userId);
    if (userId != "undefined") userSocketMap[userId] = socket.id
    console.log(userSocketMap);
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))

    })
})
export { app, io, server };