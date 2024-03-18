import express from "express";
import { notificationController, notificationToDeviceController } from "../controller/notificationController.js";
const router = express.Router();
router.get('/sendNotification', notificationController);
router.post('/sendNotificationTosDevices', notificationToDeviceController);

export default router;