import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: String,
    experience: String,
    interviewType: String,
    rounds: Array,
    report: Object,
    status: { type: String, default: "completed" }
}, { timestamps: true });

export default mongoose.model("Interview", interviewSchema);