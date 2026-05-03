import * as dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";
import Interview from "../models/Interview.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const askGroq = async (prompt) => {
    const completion = await groq.chat.completions.create({
        messages: [
            { 
                role: "system", 
                content: "You are an expert AI interviewer. Always respond in English only. Never use any other language." 
            },
            { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
    });
    return completion.choices[0]?.message?.content || "";
};

const extractResumeKeywords = (resumeText = "") => {
    const skillWords = [
        "react", "node", "express", "mongodb", "mysql", "postgresql", "redis",
        "javascript", "typescript", "python", "java", "c++", "c#", "aws", "azure",
        "docker", "kubernetes", "rest api", "graphql", "machine learning", "dsa",
        "html", "css", "tailwind", "redux", "firebase", "git", "ci/cd"
    ];

    const lower = resumeText.toLowerCase();
    return skillWords.filter((word) => lower.includes(word)).slice(0, 8);
};

export const generateQuestion = async (req, res) => {
    try {
        const { role, experience, interviewType, round, previousQA, resumeText, questionCount } = req.body;
        const askedQuestions = (previousQA || [])
            .map((qa) => qa?.question?.trim())
            .filter(Boolean)
            .slice(-8);
        const resumeKeywords = extractResumeKeywords(resumeText || "");
        const uniqueToken = Date.now();

        let roundContext = "";
        if (round === "theory") {
            roundContext = `You are conducting Round 1 - Theory round. This round has exactly 5 questions. 
Current question number: ${questionCount + 1} of 5.
Ask technical theory questions related to ${role}. Base questions on candidate profile and resume.
Focus on practical depth, trade-offs, debugging, architecture and real-world scenarios.
DO NOT ask generic textbook-only questions unless no resume/profile signal exists.`;
        }
        if (round === "resume") {
            roundContext = `You are conducting Round 1 - Resume-Based round for a non-technical interview. This round has exactly 5 questions.
Current question number: ${questionCount + 1} of 5.
Ask questions strictly based on the candidate's resume, projects, achievements, internships, responsibilities, communication and decision-making.
Do not ask coding or DSA questions.`;
        }
        if (round === "coding") {
            roundContext = `You are conducting Round 2 - Coding/DSA round. This round has exactly 2 DSA questions.
Current question number: ${questionCount + 1} of 2.
Ask a DSA (Data Structures & Algorithms) problem solving question relevant to ${role}.
Give a clear problem statement with example input/output.`;
        }
        if (round === "hr") {
            roundContext = `You are conducting the HR round. Ask behavioral and situational questions.
Assess communication skills, confidence, and cultural fit.`;
        }

        const resumeContext = resumeText
            ? `\nCandidate's Resume (excerpt):\n${resumeText.slice(0, 1400)}`
            : "";
        const keywordContext = resumeKeywords.length
            ? `\nDetected Resume Keywords: ${resumeKeywords.join(", ")}`
            : "";

        const previousContext = previousQA?.length > 0
            ? `Previous Q&A:\n${previousQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n")}`
            : "";
        const askedContext = askedQuestions.length
            ? `\nAlready Asked Questions (MUST AVOID REPEATING):\n${askedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
            : "";

        const prompt = `You are an expert AI interviewer conducting a ${interviewType} interview for a ${experience} ${role} position.

${roundContext}
${resumeContext}
${keywordContext}
${previousContext}
${askedContext}

Generate ONE interview question based on the candidate's background.
Hard requirements:
- Question must be NEW and substantially different from all previously asked questions.
- Do not repeat same wording, same idea, or close paraphrase of any prior question.
- For THEORY round, anchor the question to role/resume keywords when available.
- Ask exactly one concise question sentence (max 45 words).
- Do not include numbering, headings, explanation, hints, or multiple questions.
- Uniqueness token (ignore in output): ${uniqueToken}
IMPORTANT: Respond in ENGLISH ONLY.
Respond with ONLY the question, nothing else.`;

        const question = await askGroq(prompt);
        res.json({ question: question.trim() });
    } catch (error) {
        console.log("Groq Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const evaluateAnswer = async (req, res) => {
    try {
        const {
            role,
            experience,
            question,
            answer,
            round,
            questionCount,
            hrElapsedSeconds,
            hrTimeLimitSeconds,
        } = req.body;

        let decisionRule = "";

        if (round === "theory") {
            decisionRule = `This is the Theory round. Exactly 5 questions must be asked. Current question number: ${questionCount}. 
If questionCount < 5, set decision to "continue". If questionCount >= 5, set decision to "end_round".`;
        } else if (round === "resume") {
            decisionRule = `This is the Resume-Based round for non-technical interviews. Exactly 5 questions must be asked. Current question number: ${questionCount}.
If questionCount < 5, set decision to "continue". If questionCount >= 5, set decision to "end_round".`;
        } else if (round === "coding") {
            decisionRule = `This is the Coding round. Exactly 2 DSA questions must be asked. Current question number: ${questionCount}.
If questionCount < 2, set decision to "continue". If questionCount >= 2, set decision to "end_round".`;
        } else if (round === "hr") {
            decisionRule = `This is the HR round (Round 3). There is no fixed question limit.
Current HR question number: ${questionCount}.
Current elapsed time in HR round: ${hrElapsedSeconds ?? 0} seconds.
HR round time limit: ${hrTimeLimitSeconds ?? 600} seconds.
You may continue asking questions only while time remains.
Set decision to "continue" if more assessment is needed.
Set decision to "end_round" if time limit is reached OR when you are confident about final HR evaluation.`;
        }

        const prompt = `You are an expert AI interviewer evaluating a ${experience} ${role} candidate.

Question: ${question}
Candidate's Answer: ${answer}

${decisionRule}

Respond in this EXACT JSON format:
{
  "score": <number 0-10>,
  "feedback": "<brief feedback>",
  "passed": <true if score >= 6, false otherwise>,
  "decision": "<continue or end_round>",
  "roundPassed": <true if overall round performance is good, false otherwise>
}

IMPORTANT: Respond in ENGLISH ONLY.
Respond with ONLY the JSON, nothing else.`;

        const text = await askGroq(prompt);
        const clean = text.replace(/```json|```/g, "").trim();
        const evaluation = JSON.parse(clean);

        // Hard guard: HR round must end once round-level time limit is reached.
        if (
            round === "hr" &&
            typeof hrElapsedSeconds === "number" &&
            typeof hrTimeLimitSeconds === "number" &&
            hrElapsedSeconds >= hrTimeLimitSeconds
        ) {
            evaluation.decision = "end_round";
        }

        res.json(evaluation);
    } catch (error) {
        console.log("Groq Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const generateReport = async (req, res) => {
    try {
        const { role, experience, interviewType, rounds } = req.body;

        const prompt = `You are an expert AI interviewer. Generate a detailed interview report for a ${experience} ${role} candidate.

Interview Type: ${interviewType}
Rounds Data: ${JSON.stringify(rounds)}

Generate a comprehensive report in this EXACT JSON format:
{
  "overallScore": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "passed": <true/false>,
  "summary": "<2-3 sentence overall summary>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<area1>", "<area2>", "<area3>"],
  "roundWise": [
    {
      "round": "<round name>",
      "score": <0-10>,
      "feedback": "<feedback>"
    }
  ],
  "recommendation": "<final recommendation>"
}

IMPORTANT: Respond in ENGLISH ONLY.
Respond with ONLY the JSON, nothing else.`;

        const text = await askGroq(prompt);
        const clean = text.replace(/```json|```/g, "").trim();
        const report = JSON.parse(clean);

        await Interview.create({
            userId: req.user.id,
            role,
            experience,
            interviewType,
            rounds,
            report,
            status: report.passed ? "passed" : "failed"
        });

        res.json({ report });
    } catch (error) {
        console.log("Groq Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ interviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const saveInterview = async (req, res) => {
    try {
        const interview = await Interview.create({ ...req.body, userId: req.user.id });
        res.json({ interview });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};