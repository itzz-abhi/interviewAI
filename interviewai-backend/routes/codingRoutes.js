import express from "express";
import { generateProblem, runCode, submitCode } from "../controllers/codingController.js";

const router = express.Router();
router.post("/generate", generateProblem);
router.post("/run", runCode);
router.post("/submit", submitCode);

export default router;