import express from "express";
import { googleAuth, logout } from "../controllers/authController.js";

const router = express.Router();
router.post("/google", googleAuth);
router.post("/logout", logout);

export default router;