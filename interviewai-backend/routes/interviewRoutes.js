import express from "express";
import {
    generateQuestion,
    evaluateAnswer,
    generateReport,
    getHistory,
    saveInterview
} from "../controllers/interviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate-question", verifyToken, generateQuestion);
router.post("/evaluate-answer", verifyToken, evaluateAnswer);
router.post("/generate-report", verifyToken, generateReport);
router.get("/history", verifyToken, getHistory);
router.post("/save", verifyToken, saveInterview);

export default router;