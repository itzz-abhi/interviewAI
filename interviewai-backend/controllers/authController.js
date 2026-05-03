import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const googleAuth = async (req, res) => {
    try {
        const { name, email, image } = req.body;
        const normalizedEmail = String(email || "").trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        let user = await User.findOne({ email: normalizedEmail });
        let isNewUser = false;
        
        if (!user) {
            user = await User.create({ 
                name, 
                email: normalizedEmail, 
                image
            });
            isNewUser = true;
        }
        
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );
        
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax"
        });
        
        res.json({ user, isNewUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ message: "Logged out!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};