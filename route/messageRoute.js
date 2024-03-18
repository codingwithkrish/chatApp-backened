import express from "express";
import { sendMessages, getMessages } from "../controller/messageController.js"
const router = express.Router();
router.post('/send/:userId', sendMessages);
router.post('/:userId', getMessages);

export default router;