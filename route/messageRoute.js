import express from "express";
import { sendMessages, getMessages, acceptMoney } from "../controller/messageController.js"
const router = express.Router();
router.get('/accept-money/:messageId', acceptMoney);
router.post('/send/:userId', sendMessages);
router.post('/:userId', getMessages);


export default router;