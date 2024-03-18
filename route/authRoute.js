import express from "express";
import { sendOtp, verifyOtp, signup, refreshToken, logout } from '../controller/usersController.js';
const router = express.Router();
router.post('/sendotp', sendOtp);
router.post('/verifyotp', verifyOtp);
router.post('/register', signup);
router.post("/refresh-token", refreshToken);
export default router;