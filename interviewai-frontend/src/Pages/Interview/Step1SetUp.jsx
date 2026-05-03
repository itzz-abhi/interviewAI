import { useState } from "react";
import { motion } from "framer-motion";
import { RiRobot3Fill } from "react-icons/ri";
import { BsMicFill } from "react-icons/bs";
import { FaCode, FaUser, FaBriefcase, FaFileUpload } from "react-icons/fa";
import { MdWork } from "react-icons/md";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Android Developer",
  "iOS Developer",
  "UI/UX Designer",
  "Product Manager",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.1 }
  })
};

function Step1Setup({ onStart }) {
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResume(file);
    setError("");
    setResumeLoading(true);

    if (file.type === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map(item => item.str).join(" ");
          fullText += text + "\n";
        }
        setResumeText(fullText.trim());
      } catch (err) {
        console.error("PDF Error:", err);
        setResumeText("");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => setResumeText(e.target.result);
      reader.readAsText(file);
    }
    setResumeLoading(false);
  };

  const handleStart = () => {
    if (!name.trim()) { setError("Please enter your name!"); return; }
    if (!experience) { setError("Please select experience level!"); return; }
    if (!interviewType) { setError("Please select interview type!"); return; }
    if (!role && !customRole.trim()) { setError("Please select or enter a role!"); return; }
    if (!resume) { setError("Please upload your resume!"); return; }

    setError("");
    onStart({
      name: name.trim(),
      experience,
      interviewType,
      role: role || customRole.trim(),
      resumeText: resumeText || "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-xl">
              <RiRobot3Fill size={24} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Setup Your Interview</h1>
          <p className="text-gray-400">Tell us about yourself so AI can personalize your interview</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 space-y-6">

          {/* Name */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <FaUser size={14} className="text-blue-400" /> Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </motion.div>

          {/* Experience */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FaBriefcase size={14} className="text-blue-400" /> Experience Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Fresher", "Experienced"].map((exp) => (
                <motion.button
                  key={exp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExperience(exp)}
                  className={`py-3 rounded-xl border font-medium text-sm transition cursor-pointer ${
                    experience === exp
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}>
                  {exp === "Fresher" ? "🎓 Fresher" : "💼 Experienced"}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Interview Type */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <MdWork size={16} className="text-blue-400" /> Interview Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "Technical", icon: <FaCode size={16} />, label: "Technical" },
                { value: "Non-Technical", icon: <BsMicFill size={16} />, label: "Non-Technical" },
              ].map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInterviewType(type.value)}
                  className={`py-3 rounded-xl border font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    interviewType === type.value
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}>
                  {type.icon} {type.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Role */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FaBriefcase size={14} className="text-blue-400" /> Target Role
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {roles.map((r) => (
                <motion.button
                  key={r}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setRole(r); setCustomRole(""); }}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer ${
                    role === r
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}>
                  {r}
                </motion.button>
              ))}
            </div>
            <input
              type="text"
              value={customRole}
              onChange={(e) => { setCustomRole(e.target.value); setRole(""); }}
              placeholder="Or type your custom role..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition text-sm"
            />
          </motion.div>

          {/* Resume Upload — Required */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <FaFileUpload size={14} className="text-blue-400" /> Upload Resume
              <span className="text-red-400 font-bold">*</span>
            </label>
            <label className="w-full cursor-pointer">
              <div className={`w-full border-2 border-dashed rounded-xl px-4 py-6 text-center transition ${
                resume
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-gray-700 hover:border-gray-500 bg-gray-800"
              }`}>
                {resumeLoading ? (
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <FaFileUpload size={18} />
                    </motion.div>
                    <span className="text-sm">Reading resume...</span>
                  </div>
                ) : resume ? (
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <FaFileUpload size={18} />
                    <span className="text-sm font-medium">{resume.name}</span>
                    <span className="text-xs text-green-400">✓ Uploaded</span>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <FaFileUpload size={24} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-sm font-medium text-gray-400">Click to upload your resume</p>
                    <p className="text-xs mt-1 text-gray-600">PDF or TXT — AI will use it to ask personalized questions</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </label>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center bg-red-950/30 border border-red-900 rounded-xl py-2">
              ⚠️ {error}
            </motion.p>
          )}

          {/* Start Button */}
          <motion.button
            variants={fadeUp} initial="hidden" animate="visible" custom={5}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold text-base transition cursor-pointer">
            Start Interview 🚀
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
}

export default Step1Setup;