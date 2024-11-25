import express from "express";
import { getAlluser, logout } from '../middelware/usersController.js';
const router = express.Router();
router.get('/getalluser', getAlluser);
router.post("/logout", logout);

export default router;