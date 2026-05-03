import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { RiRobot3Fill } from "react-icons/ri";
import { FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";
import { MdHistory } from "react-icons/md";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.4, delay: i * 0.1 }
    })
};

const gradeColors = {
    A: "text-green-400 bg-green-950 border-green-800",
    B: "text-blue-400 bg-blue-950 border-blue-800",
    C: "text-yellow-400 bg-yellow-950 border-yellow-800",
    D: "text-orange-400 bg-orange-950 border-orange-800",
    F: "text-red-400 bg-red-950 border-red-800",
};

function HistoryPage() {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!userData) { navigate("/"); return; }
        fetchHistory();
    }, [userData]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(serverUrl + "/api/interview/history", { withCredentials: true });
            setInterviews(res.data.interviews || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-blue-600 text-white p-3 rounded-xl">
                            <MdHistory size={24} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Interview History</h1>
                    <p className="text-gray-400">Your past interview performances</p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <RiRobot3Fill size={32} className="text-blue-400" />
                        </motion.div>
                    </div>
                )}

                {/* Empty */}
                {!loading && interviews.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg mb-4">No interviews yet!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/interview")}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl cursor-pointer transition">
                            Start Your First Interview 🚀
                        </motion.button>
                    </div>
                )}

                {/* Interview List */}
                {!loading && interviews.length > 0 && !selected && (
                    <div className="space-y-4">
                        {interviews.map((interview, i) => (
                            <motion.div
                                key={interview._id}
                                variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.1}
                                whileHover={{ y: -3 }}
                                onClick={() => setSelected(interview)}
                                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-6 cursor-pointer transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Grade Badge */}
                                        <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold ${gradeColors[interview.report?.grade] || gradeColors["F"]}`}>
                                            {interview.report?.grade || "?"}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{interview.role}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {interview.interviewType} • {interview.experience} • {formatDate(interview.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Score */}
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <FaStar className="text-yellow-400" size={14} />
                                                <span className="font-bold text-white">{interview.report?.overallScore || 0}</span>
                                                <span className="text-gray-500 text-sm">/100</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Overall Score</p>
                                        </div>
                                        {/* Status */}
                                        {interview.status === "passed"
                                            ? <FaCheckCircle className="text-green-400" size={22} />
                                            : <FaTimesCircle className="text-red-400" size={22} />
                                        }
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Interview Detail */}
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}>

                        {/* Back Button */}
                        <button
                            onClick={() => setSelected(null)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 cursor-pointer transition">
                            ← Back to History
                        </button>

                        {/* Result Card */}
                        <div className={`rounded-3xl border p-8 mb-6 text-center ${selected.status === "passed" ? "bg-green-950/30 border-green-800" : "bg-red-950/30 border-red-800"}`}>
                            <div className="text-4xl mb-3">
                                {selected.status === "passed" ? "🎉" : "😔"}
                            </div>
                            <h2 className="text-2xl font-bold mb-1">
                                {selected.role} — {selected.interviewType}
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">{formatDate(selected.createdAt)}</p>
                            <p className="text-gray-300 text-sm mb-6">{selected.report?.summary}</p>
                            <div className="flex items-center justify-center gap-6">
                                <div className="text-center">
                                    <div className="flex items-center gap-1">
                                        <FaStar className="text-yellow-400" size={18} />
                                        <span className="text-3xl font-bold text-white">{selected.report?.overallScore}</span>
                                        <span className="text-gray-400">/100</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Overall Score</p>
                                </div>
                                <div className="w-px h-12 bg-gray-700" />
                                <div className="text-center">
                                    <div className={`text-3xl font-bold px-4 py-1 rounded-xl border ${gradeColors[selected.report?.grade] || gradeColors["F"]}`}>
                                        {selected.report?.grade}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Grade</p>
                                </div>
                            </div>
                        </div>

                        {/* Round Wise */}
                        {selected.report?.roundWise?.length > 0 && (
                            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6">
                                <h3 className="text-lg font-bold text-white mb-4">Round-wise Performance</h3>
                                <div className="space-y-4">
                                    {selected.report.roundWise.map((r, i) => (
                                        <div key={i} className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-white capitalize">{r.round}</span>
                                                <span className={`text-sm font-bold ${r.score >= 6 ? "text-green-400" : "text-red-400"}`}>
                                                    {r.score}/10
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                                                <div
                                                    className={`h-full rounded-full ${r.score >= 6 ? "bg-green-500" : "bg-red-500"}`}
                                                    style={{ width: `${r.score * 10}%` }}
                                                />
                                            </div>
                                            <p className="text-gray-400 text-sm">{r.feedback}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Strengths & Improvements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 text-green-400">✅ Strengths</h3>
                                <div className="space-y-2">
                                    {selected.report?.strengths?.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <FaCheckCircle className="text-green-400 shrink-0 mt-0.5" size={14} />
                                            <p className="text-gray-300 text-sm">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 text-orange-400">⚠️ Improvements</h3>
                                <div className="space-y-2">
                                    {selected.report?.improvements?.map((imp, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <FaTimesCircle className="text-orange-400 shrink-0 mt-0.5" size={14} />
                                            <p className="text-gray-300 text-sm">{imp}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        {selected.report?.recommendation && (
                            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-8">
                                <h3 className="text-lg font-bold text-white mb-3">💡 AI Recommendation</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">{selected.report.recommendation}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/interview")}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold cursor-pointer transition">
                                New Interview 🚀
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate("/")}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-4 rounded-xl font-semibold cursor-pointer transition">
                                Go Home 🏠
                            </motion.button>
                        </div>
                    </motion.div>
                )}

            </motion.div>
        </div>
    );
}

export default HistoryPage;