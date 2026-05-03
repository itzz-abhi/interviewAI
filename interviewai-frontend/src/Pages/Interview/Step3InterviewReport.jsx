import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RiRobot3Fill } from "react-icons/ri";
import { FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";
import { MdOutlineReport, MdOutlineTrendingUp, MdOutlineTrendingDown } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

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

function Step3InterviewReport({ report }) {
    const navigate = useNavigate();

    if (!report || report.error) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">⚠️ Report generation failed!</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl cursor-pointer transition">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const gradeClass = gradeColors[report.grade] || gradeColors["F"];

    return (
        <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="bg-blue-600 text-white p-3 rounded-xl">
                            <RiRobot3Fill size={24} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Interview Report</h1>
                    <p className="text-gray-400">Here's your detailed performance analysis</p>
                </div>

                {/* Overall Result Card */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={0}
                    className={`rounded-3xl border p-8 mb-6 text-center ${report.passed ? "bg-green-950/30 border-green-800" : "bg-red-950/30 border-red-800"}`}>
                    <div className="text-5xl mb-4">
                        {report.passed ? "🎉" : "😔"}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                        {report.passed ? "Congratulations! You Passed!" : "Better Luck Next Time!"}
                    </h2>
                    <p className="text-gray-400 text-sm">{report.summary}</p>

                    {/* Score + Grade */}
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="text-center">
                            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Overall Score</p>
                            <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-400" size={20} />
                                <span className="text-4xl font-bold text-white">{report.overallScore}</span>
                                <span className="text-gray-400 text-lg">/100</span>
                            </div>
                        </div>
                        <div className="w-px h-16 bg-gray-700" />
                        <div className="text-center">
                            <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Grade</p>
                            <div className={`text-4xl font-bold px-5 py-2 rounded-2xl border ${gradeClass}`}>
                                {report.grade}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Round Wise */}
                {report.roundWise?.length > 0 && (
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={1}
                        className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MdOutlineReport className="text-blue-400" size={20} />
                            Round-wise Performance
                        </h3>
                        <div className="space-y-4">
                            {report.roundWise.map((r, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.2}
                                    className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-white capitalize">{r.round}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${r.score >= 6 ? "text-green-400" : "text-red-400"}`}>
                                                {r.score}/10
                                            </span>
                                            {r.score >= 6
                                                ? <FaCheckCircle className="text-green-400" size={16} />
                                                : <FaTimesCircle className="text-red-400" size={16} />
                                            }
                                        </div>
                                    </div>
                                    {/* Score Bar */}
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${r.score * 10}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className={`h-full rounded-full ${r.score >= 6 ? "bg-green-500" : "bg-red-500"}`}
                                        />
                                    </div>
                                    <p className="text-gray-400 text-sm">{r.feedback}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Strengths */}
                {report.strengths?.length > 0 && (
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MdOutlineTrendingUp className="text-green-400" size={20} />
                            Strengths
                        </h3>
                        <div className="space-y-2">
                            {report.strengths.map((s, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <FaCheckCircle className="text-green-400 shrink-0 mt-0.5" size={16} />
                                    <p className="text-gray-300 text-sm">{s}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Improvements */}
                {report.improvements?.length > 0 && (
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={3}
                        className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <MdOutlineTrendingDown className="text-orange-400" size={20} />
                            Areas to Improve
                        </h3>
                        <div className="space-y-2">
                            {report.improvements.map((imp, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <FaTimesCircle className="text-orange-400 shrink-0 mt-0.5" size={16} />
                                    <p className="text-gray-300 text-sm">{imp}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Recommendation */}
                {report.recommendation && (
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={4}
                        className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-8">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <HiSparkles className="text-blue-400" size={20} />
                            AI Recommendation
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{report.recommendation}</p>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="visible" custom={5}
                    className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/interview")}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold cursor-pointer transition">
                        Try Again 🚀
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/")}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-4 rounded-xl font-semibold cursor-pointer transition">
                        Go Home 🏠
                    </motion.button>
                </motion.div>

            </motion.div>
        </div>
    );
}

export default Step3InterviewReport;