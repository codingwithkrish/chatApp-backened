import express from "express";
import connectDB from "./config/db.js";
import dotenv from 'dotenv';
import colors from 'colors'
import messageRoute from './route/messageRoute.js'
import authRoute from './route/authRoute.js'
import userRoute from './route/userRoute.js';
import notificationRoute from './route/notificationRoute.js'
import cors from "cors";
import { verifyAccessToken } from "./controller/jwt_helper.js"
import { app, server } from "./socket/socket.js";

dotenv.config();
connectDB()
app.use(cors())

app.use(express.json());

app.get("/", async (req, res, next) => {
    console.log(req.headers["authorization"]);
    res.send("Hello from G22");
});
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/notification", notificationRoute)

app.use("/api/v1/users", verifyAccessToken, userRoute);
app.use("/api/v1/messages", verifyAccessToken, messageRoute);

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT} IN ${process.env.DEV_MODE}`.bgCyan.white)
})