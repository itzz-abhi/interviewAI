import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiRobot3Fill } from "react-icons/ri";
import { BsMicFill, BsMicMuteFill } from "react-icons/bs";
import { FaUser, FaVideo, FaVideoSlash } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../../App";

const HR_ROUND_TIME_LIMIT_SECONDS = 10 * 60;

function Step2Interview({ interviewData, onFinish }) {
    const isNonTechnical = interviewData?.interviewType === "Non-Technical";
    const initialRound = isNonTechnical ? "resume" : "theory";
    const totalRounds = isNonTechnical ? 2 : 3;
    const roundOrder = isNonTechnical ? ["resume", "hr"] : ["theory", "coding", "hr"];
    const progressLabels = isNonTechnical ? ["Resume", "HR"] : ["Theory", "Coding", "HR"];
    const roundLabels = isNonTechnical
        ? {
            resume: `Round 1 of ${totalRounds} — Resume-Based (5 Questions)`,
            hr: `Round 2 of ${totalRounds} — HR (Time-Based)`,
        }
        : {
            theory: `Round 1 of ${totalRounds} — Theory (5 Questions)`,
            coding: `Round 2 of ${totalRounds} — Coding (2 DSA Questions)`,
            hr: `Round 3 of ${totalRounds} — HR (Time-Based)`,
        };

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [round, setRound] = useState(initialRound);
    const [roundNumber, setRoundNumber] = useState(1);
    const [qaHistory, setQaHistory] = useState([]);
    const [questionCount, setQuestionCount] = useState(0);
    const [scores, setScores] = useState([]);
    const [status, setStatus] = useState("generating");
    const [roundResult, setRoundResult] = useState(null);
    const [timer, setTimer] = useState(120);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [hasTriedCamera, setHasTriedCamera] = useState(false);

    const timerRef = useRef(null);
    const recognitionRef = useRef(null);
    const videoRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const isSubmittingRef = useRef(false);
    const questionCountRef = useRef(0);
    const scoresRef = useRef([]);
    const qaHistoryRef = useRef([]);
    const roundRef = useRef(initialRound);
    const answerRef = useRef("");
    const hrRoundStartedAtRef = useRef(null);

    // ── Generate Question ──
  const generateQuestion = async (currentRound, currentHistory) => {
    setIsLoading(true);
    setStatus("generating");
    setAnswer("");
    answerRef.current = "";
    try {
        const res = await axios.post(
            serverUrl + "/api/interview/generate-question",
            {
                role: interviewData.role,
                experience: interviewData.experience,
                interviewType: interviewData.interviewType,
                round: currentRound,
                previousQA: currentHistory,
                resumeText: interviewData.resumeText || "",
                questionCount: questionCountRef.current,
            },
            { withCredentials: true }
        );
        const q = res.data.question;
        setQuestion(q);
        setStatus("answering");
        speakQuestion(q);
        startTimer();
    } catch (err) {
        console.error(err);
        setStatus("answering");
    } finally {
        setIsLoading(false);
    }
};

    const stopCamera = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    };

    const startCamera = async () => {
        setHasTriedCamera(true);
        if (!navigator?.mediaDevices?.getUserMedia) {
            setCameraError("This browser does not support webcam access.");
            setIsCameraOn(false);
            return;
        }

        // Prevent duplicate camera requests in dev StrictMode or rapid toggles.
        if (mediaStreamRef.current) {
            if (videoRef.current && !videoRef.current.srcObject) {
                videoRef.current.srcObject = mediaStreamRef.current;
            }
            setCameraError("");
            setIsCameraOn(true);
            return;
        }

        try {
            setCameraError("");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });
            mediaStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Some browsers may reject play() even after permission; keep stream active.
                videoRef.current.play().catch(() => {});
            }
            setIsCameraOn(true);
        } catch (error) {
            console.error("Camera error:", error);
            const errorName = error?.name || "";
            if (errorName === "NotAllowedError" || errorName === "SecurityError") {
                setCameraError("Camera permission denied. Please allow webcam access in browser settings.");
            } else if (errorName === "NotReadableError") {
                setCameraError("Camera is busy in another app/tab. Close other camera apps and retry.");
            } else {
                setCameraError("Unable to access camera right now. Please retry.");
            }
            setIsCameraOn(false);
        }
    };

    const toggleCamera = async () => {
        setCameraError("");
        if (isCameraOn) {
            stopCamera();
            return;
        }
        await startCamera();
    };

    // ── Text to Speech ──
    const speakQuestion = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    // ── Timer ──
    const startTimer = () => {
        clearInterval(timerRef.current);
        setTimer(120);
        timerRef.current = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    submitAnswer();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
    };

    // ── Speech Recognition ──
    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser does not support speech recognition!");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (e) => {
            const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
            setAnswer(transcript);
            answerRef.current = transcript;
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
    };

    // ── Submit Answer ──
    const submitAnswer = async () => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        clearInterval(timerRef.current);
        recognitionRef.current?.stop();
        setIsListening(false);
        setStatus("evaluating");

        const currentAnswer = answerRef.current.trim() || "No answer provided";
        const currentQuestion = question;
        const currentRound = roundRef.current;
        const newCount = questionCountRef.current + 1;
        const hrElapsedSeconds =
            currentRound === "hr" && hrRoundStartedAtRef.current
                ? Math.floor((Date.now() - hrRoundStartedAtRef.current) / 1000)
                : null;

        try {
            const res = await axios.post(
                serverUrl + "/api/interview/evaluate-answer",
                {
                    role: interviewData.role,
                    experience: interviewData.experience,
                    question: currentQuestion,
                    answer: currentAnswer,
                    round: currentRound,
                    questionCount: newCount,
                    hrElapsedSeconds,
                    hrTimeLimitSeconds: HR_ROUND_TIME_LIMIT_SECONDS,
                },
                { withCredentials: true }
            );

            const evaluation = res.data;
            const newQA = { question: currentQuestion, answer: currentAnswer, ...evaluation };
            const updatedHistory = [...qaHistoryRef.current, newQA];
            const updatedScores = [...scoresRef.current, evaluation.score];

            qaHistoryRef.current = updatedHistory;
            scoresRef.current = updatedScores;
            questionCountRef.current = newCount;

            setQaHistory(updatedHistory);
            setScores(updatedScores);
            setQuestionCount(newCount);

            if (evaluation.decision === "end_round") {
                const passed = evaluation.roundPassed;
                const avgScore = updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length;
                setRoundResult({ passed, avgScore: avgScore.toFixed(1) });
                setStatus("roundEnd");
                isSubmittingRef.current = false;
            } else {
                isSubmittingRef.current = false;
                generateQuestion(currentRound, updatedHistory);
            }
        } catch (err) {
            console.error(err);
            isSubmittingRef.current = false;
            setStatus("answering");
        }
    };

    // ── Next Round ──
    const handleNextRound = () => {
        if (!roundResult?.passed) {
            handleFinish();
            return;
        }

        // Reset round state
        questionCountRef.current = 0;
        scoresRef.current = [];
        qaHistoryRef.current = [];
        setQuestionCount(0);
        setScores([]);
        setQaHistory([]);
        setRoundResult(null);

        const currentIndex = roundOrder.indexOf(round);
        const hasNextRound = currentIndex >= 0 && currentIndex < roundOrder.length - 1;

        if (!hasNextRound) {
            handleFinish();
            return;
        }

        const nextRound = roundOrder[currentIndex + 1];
        roundRef.current = nextRound;
        setRound(nextRound);
        setRoundNumber(currentIndex + 2);

        if (nextRound === "hr") {
            hrRoundStartedAtRef.current = Date.now();
        }

        generateQuestion(nextRound, []);
    };

    // ── Finish Interview ──
    const handleFinish = async () => {
        setStatus("finished");
        try {
            const res = await axios.post(
                serverUrl + "/api/interview/generate-report",
                {
                    role: interviewData.role,
                    experience: interviewData.experience,
                    interviewType: interviewData.interviewType,
                    rounds: qaHistoryRef.current,
                },
                { withCredentials: true }
            );
            onFinish(res.data.report);
        } catch (err) {
            console.error(err);
            onFinish({ error: "Report generation failed" });
        }
    };

    // ── Init ──
    useEffect(() => {
        roundRef.current = initialRound;
        setRound(initialRound);
        setRoundNumber(1);
        generateQuestion(initialRound, []);
        return () => {
            clearInterval(timerRef.current);
            window.speechSynthesis.cancel();
            stopCamera();
        };
    }, []);

    const mins = String(Math.floor(timer / 60)).padStart(2, "0");
    const secs = String(timer % 60).padStart(2, "0");
    const isLow = timer < 30;

    // Round progress indicator
    const getRoundStep = () => {
        const index = roundOrder.indexOf(round);
        return index >= 0 ? index + 1 : 1;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start px-4 py-8 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white p-2 rounded-xl">
                            <RiRobot3Fill size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white">{interviewData.role}</h2>
                            <p className="text-gray-400 text-xs">{interviewData.interviewType} Interview</p>
                        </div>
                    </div>
                    {/* Timer */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold transition-all ${isLow ? "bg-red-950 text-red-400 border border-red-800" : "bg-gray-800 text-gray-300 border border-gray-700"}`}>
                        <MdOutlineTimer size={16} />
                        {mins}:{secs}
                    </div>
                </div>

                {/* Round Progress Bar */}
                <div className="flex items-center gap-2 mb-8">
                    {Array.from({ length: totalRounds }).map((_, i) => {
                        const stepNum = i + 1;
                        const currentStep = getRoundStep();
                        return (
                            <div key={i} className="flex items-center flex-1">
                                <div className={`flex flex-col items-center flex-1`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                        stepNum < currentStep
                                            ? "bg-green-600 border-green-500 text-white"
                                            : stepNum === currentStep
                                            ? "bg-blue-600 border-blue-500 text-white"
                                            : "bg-gray-800 border-gray-700 text-gray-500"
                                    }`}>
                                        {stepNum < currentStep ? "✓" : stepNum}
                                    </div>
                                    <span className={`text-xs mt-1 ${stepNum === currentStep ? "text-blue-400" : "text-gray-500"}`}>
                                        {progressLabels[i]}
                                    </span>
                                </div>
                                {i < totalRounds - 1 && (
                                    <div className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${stepNum < currentStep ? "bg-green-600" : "bg-gray-700"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Current Round Label */}
                <div className="text-center mb-6">
                    <span className="text-xs font-bold text-blue-400 bg-blue-950/50 border border-blue-900 px-4 py-1.5 rounded-full uppercase tracking-wider">
                        {roundLabels[round]}
                    </span>
                </div>

                {/* AI Avatar */}
                <div className="flex justify-center mb-6">
                    <motion.div
                        animate={isSpeaking ? { scale: [1, 1.06, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${isSpeaking ? "border-blue-500 bg-blue-950" : "border-gray-700 bg-gray-900"}`}>
                        <RiRobot3Fill size={36} className={isSpeaking ? "text-blue-400" : "text-gray-400"} />
                    </motion.div>
                </div>

                {/* Question Card */}
                <motion.div
                    key={question}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-10 mb-6 min-h-[42vh] flex flex-col justify-center">
                    {isLoading ? (
                        <div className="flex items-center gap-3 text-gray-400">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <RiRobot3Fill size={20} />
                            </motion.div>
                            <span>AI is generating your question...</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-blue-400 font-semibold mb-3 uppercase tracking-wider">
                                Question {questionCount + 1}
                            </p>
                            <p className="text-white text-2xl md:text-3xl leading-relaxed md:leading-loose">
                                {question}
                            </p>
                        </>
                    )}
                </motion.div>

                {/* Round End Card */}
                <AnimatePresence>
                    {status === "roundEnd" && roundResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`border rounded-2xl p-6 mb-6 text-center ${roundResult.passed ? "bg-green-950 border-green-800" : "bg-red-950 border-red-800"}`}>
                            <p className="text-2xl font-bold mb-2">
                                {roundResult.passed ? "✅ Round Passed!" : "❌ Round Failed!"}
                            </p>
                            <p className="text-gray-300 mb-1">
                                Average Score: <span className="font-bold text-white">{roundResult.avgScore}/10</span>
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                                {roundResult.passed
                                    ? round === "hr"
                                        ? "Interview Complete! 🎉"
                                        : "Moving to next round..."
                                    : "Better luck next time!"}
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextRound}
                                className={`px-8 py-3 rounded-xl font-semibold cursor-pointer transition ${roundResult.passed ? "bg-green-600 hover:bg-green-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}>
                                {roundResult.passed
                                    ? (round === "hr")
                                        ? "View Report 📊"
                                        : "Next Round →"
                                    : "View Report 📊"}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

               {/* Answer Section */}
{status === "answering" && (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
            <FaUser size={14} className="text-blue-400" />
            <span className="text-sm text-gray-400 font-medium">Your Answer</span>
            {isListening && (
                <span className="text-xs text-green-400 bg-green-950 border border-green-800 px-2 py-0.5 rounded-full animate-pulse">
                    🎤 Listening...
                </span>
            )}
        </div>

        {/* Coding round mein text box dikhega */}
        {round === "coding" && (
            <textarea
                value={answer}
                onChange={(e) => {
                    setAnswer(e.target.value);
                    answerRef.current = e.target.value;
                }}
                placeholder="Type your coding answer here..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none text-sm mb-4"
            />
        )}

        {/* Theory aur HR round mein sirf voice */}
        {round !== "coding" && (
            <div className="flex flex-col items-center justify-center py-6 mb-4">
                <motion.div
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 border-2 transition-all ${
                        isListening
                            ? "bg-red-600 border-red-500"
                            : "bg-gray-800 border-gray-600"
                    }`}>
                    <BsMicFill size={24} className="text-white" />
                </motion.div>
                <p className="text-gray-400 text-sm">
                    {isListening ? "Listening to your answer..." : "Press the mic button to speak your answer"}
                </p>
               
            </div>
        )}

        <div className="flex gap-3">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMic}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm cursor-pointer transition ${
                    isListening
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white"
                }`}>
                {isListening ? <BsMicMuteFill size={16} /> : <BsMicFill size={16} />}
                {isListening ? "Stop" : "Speak"}
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitAnswer}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm cursor-pointer transition">
                Submit Answer →
            </motion.button>
        </div>
    </motion.div>
)}

                {/* Evaluating */}
                {status === "evaluating" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="inline-block mb-3">
                            <RiRobot3Fill size={32} className="text-blue-400" />
                        </motion.div>
                        <p className="text-gray-400">AI is evaluating your answer...</p>
                    </motion.div>
                )}

                {/* Finished */}
                {status === "finished" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                        <p className="text-xl font-bold text-white mb-2">🎉 Interview Complete!</p>
                        <p className="text-gray-400">Generating your detailed report...</p>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="inline-block mt-4">
                            <RiRobot3Fill size={28} className="text-blue-400" />
                        </motion.div>
                    </motion.div>
                )}

            </motion.div>

            {/* Small floating webcam panel so question remains primary focus */}
            <div className="fixed right-4 top-24 z-20 w-56 md:w-64 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-2xl p-3 shadow-2xl">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isCameraOn ? "bg-green-500" : "bg-red-500"}`} />
                        <p className="text-xs font-medium text-gray-200">Webcam</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={toggleCamera}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer transition ${
                            isCameraOn
                                ? "bg-red-950 border-red-800 text-red-300 hover:bg-red-900/60"
                                : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                        }`}>
                        {isCameraOn ? <FaVideoSlash size={12} /> : <FaVideo size={12} />}
                        {isCameraOn ? "Off" : "On"}
                    </motion.button>
                </div>

                <div className="relative w-full bg-black rounded-xl overflow-hidden border border-gray-800 aspect-video">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isCameraOn ? "opacity-100" : "opacity-0"}`}
                    />
                    {!isCameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                            {hasTriedCamera ? "Webcam is off" : "Click On to start webcam"}
                        </div>
                    )}
                </div>
                {cameraError && (
                    <div className="mt-2">
                        <p className="text-red-400 text-[11px]">{cameraError}</p>
                        <p className="text-gray-500 text-[11px] mt-1">
                            Browser block hone par address bar ke lock icon se Camera permission Allow karke phir retry karein.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Step2Interview;