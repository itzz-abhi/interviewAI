import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { RiRobot3Fill } from "react-icons/ri";
import { BsMicFill } from "react-icons/bs";
import { FaCode, FaHistory, FaCheckCircle } from "react-icons/fa";
import { MdOutlineTimer, MdOutlineReport } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";
import { TbBrain } from "react-icons/tb";
import AuthModel from "../Components/AuthModel";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" }
  })
};

const steps = [
  { icon: <RiRobot3Fill size={26} />, step: "STEP 1", title: "Role & Experience Selection", desc: "Select your target job role and experience level so the AI can tailor the interview difficulty accordingly." },
  { icon: <BsMicFill size={26} />, step: "STEP 2", title: "Interview Type", desc: "Select Technical or Non-Technical interview based on your needs." },
  { icon: <MdOutlineTimer size={26} />, step: "STEP 3", title: "Complete Rounds", desc: "Go through Theory, Coding, and HR rounds with AI interviewer." },
  { icon: <MdOutlineReport size={26} />, step: "STEP 4", title: "Get Report", desc: "Receive detailed feedback and recommendations to improve." },
];

const capabilities = [
  { icon: <BsMicFill size={26} />, title: "Voice-Based Interview", desc: "Natural conversation with AI interviewer using advanced speech recognition and synthesis." },
  { icon: <TbBrain size={26} />, title: "Smart Questions", desc: "Questions generated based on your resume, role, and experience level for personalized practice." },
  { icon: <FaCode size={26} />, title: "Live Coding Challenges", desc: "Time-based coding rounds with real-time code execution and instant feedback." },
  { icon: <TbBrain size={26} />, title: "Webcam Integration", desc: "Practice with webcam enabled to simulate real interview conditions." },
  { icon: <MdOutlineReport size={26} />, title: "Detailed Reports", desc: "Comprehensive feedback with strengths, weaknesses, and improvement recommendations." },
  { icon: <RiRobot3Fill size={26} />, title: "Multiple Rounds", desc: "Complete interview flow with Theory, Coding, and HR rounds for tech interviews." },
];

const modes = [
  { title: "Technical Interview Mode", desc: "Simulates a real technical hiring process with AI-driven theory questions, coding challenges, and an HR round based on candidate performance." },
  { title: "Coding Contest", desc: "Solve real-world coding problems in a time-based contest environment with instant evaluation and performance tracking." },
  { title: "Non-Tech Interview Mode", desc: "Prepare for HR and behavioral interviews with AI-generated questions that assess communication, confidence, and soft skills." },
  { title: "Confidence Detection", desc: "Uses AI to assess candidate confidence by analyzing facial cues, voice tone, and response patterns." },
];

function Home() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);

  const handleStart = () => {
    if (!userData) { setShowAuth(true); return; }
    navigate("/interview");
  };

  const handleCoding = () => {
    if (!userData) { setShowAuth(true); return; }
    navigate("/coding");
  };

  return (
    <div className="bg-gray-950 min-h-screen text-white">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex items-center gap-2 text-blue-400 mb-6 bg-blue-950/50 px-4 py-2 rounded-full border border-blue-900">
          <RiRobot3Fill size={16} />
          <span className="text-sm font-medium">AI Interview Platform</span>
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white">
          Ace Your Next Interview with{" "}
          <span className="text-blue-400">AI-Powered</span>{" "}
          Practice
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed">
          Role-based mock interviews featuring intelligent follow-up questions, adaptive difficulty levels, and real-time performance evaluation to simulate a realistic interview experience.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="flex flex-wrap gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-medium cursor-pointer transition-colors">
            <BsMicFill size={16} /> Start Interview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleCoding}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-medium cursor-pointer transition-colors border border-gray-700">
            <FaCode size={16} /> Coding
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-medium cursor-pointer transition-colors border border-gray-700">
            <FaHistory size={16} /> History
          </motion.button>
        </motion.div>
      </section>

      {/* ── Steps ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12">
          How It <span className="text-blue-400">Works</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div key={i}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.2}
              whileHover={{ y: -6, backgroundColor: "#111827" }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 transition-colors cursor-default">
              <div className="w-12 h-12 bg-gray-800 text-blue-400 border border-gray-700 rounded-xl flex items-center justify-center mb-4">
                {s.icon}
              </div>
              <span className="text-xs font-bold text-blue-500 tracking-widest">{s.step}</span>
              <h3 className="text-base font-bold text-white mt-1 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12">
          Advanced AI <span className="text-blue-400">Capabilities</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((c, i) => (
            <motion.div key={i}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.15}
              whileHover={{ y: -5, backgroundColor: "#111827" }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex gap-5 items-start transition-colors cursor-default">
              <div className="w-12 h-12 bg-gray-800 text-blue-400 border border-gray-700 rounded-xl flex items-center justify-center shrink-0">
                {c.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Interview Modes ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12">
          Interview <span className="text-blue-400">Modes</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modes.map((m, i) => (
            <motion.div key={i}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.15}
              whileHover={{ y: -5, backgroundColor: "#111827" }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-8 transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-3">
                <FaCheckCircle className="text-blue-400 shrink-0" size={16} />
                <h3 className="text-lg font-bold text-white">{m.title}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Credit System ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          whileHover={{ y: -4, backgroundColor: "#111827" }}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 transition-colors">
          <div className="w-16 h-16 bg-gray-800 text-blue-400 border border-gray-700 rounded-2xl flex items-center justify-center shrink-0">
            <HiSparkles size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Completely Free</h3>
            <p className="text-gray-500 leading-relaxed">
              Practice unlimited mock interviews and coding rounds for free. No credits, no deductions, and no payment required.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-2xl mx-auto">
          <HiSparkles className="text-blue-400 mx-auto mb-4" size={36} />
          <h2 className="text-4xl font-bold mb-4">Ready to Ace Your Interview?</h2>
          <p className="text-gray-500 mb-8">Join thousands of developers who practice with InterviewAI every day.</p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full text-lg font-medium cursor-pointer transition-colors">
            Start Free Interview 🚀
          </motion.button>
        </motion.div>
      </section>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Home;