import {
    addUserPoints,
    createUser,
    findUser,
    findUserById,
    updateUserOnboarding,
    updateUserPlan
} from "../models/userModel.js"
import { generateAccessToken, generateRefreshToken } from "../middleware/tokenMiddleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    const { name, phone, email, password } = req.body;
    try {
        const user = await findUser(email, phone);
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        } 

        // Bug 1: use async version
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await createUser(name, phone, email, hashedPassword);
        if (!newUser) {
            return res.status(500).json({ message: "Error creating user" });
        }

        // Bug 2: was using jwt.sign directly — now using the middleware helpers
        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);

        // Bug 3: refresh token must be sent in httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            user: {
                id: newUser.id,
                name: newUser.name,
                phone: newUser.phone,
                email: newUser.email
            },
            accessToken
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logoutUser = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: "Logged out successfully" });
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUser(email, null);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email
            },
            accessToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Refresh token lives here because it's auth logic
export const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const accessToken = generateAccessToken(decoded.id);
        res.status(200).json({ accessToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
}


export const getProfile = async (req, res) => {
    try {
        const user = await findUserById(req.user?.id);
        console.log("Fetched user for profile:", user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            points: user.points,
            // Support both old column name (streak) and new (current_streak) during migration
            daily_streak: user.current_streak ?? user.streak ?? 0,
            current_streak: user.current_streak ?? user.streak ?? 0,
            longest_streak: user.longest_streak ?? 0,
            plan: user.plan,
            level: user.level,
            goal: user.goal,
            daily_time_commitment: user.daily_time_commitment

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateOnboarding = async (req, res) => {
    const { level, goal, daily_time_commitment } = req.body;
    if (!level || !goal || !daily_time_commitment) {
        return res.status(400).json({ message: "level, goal and daily_time_commitment are required" });
    }

    const onboardingPoints = Number(process.env.ONBOARDING_POINTS ?? 0);

    try {
        const updated = await updateUserOnboarding(req.user?.id, level, goal, daily_time_commitment);
        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        if (onboardingPoints !== 0) {
            await addUserPoints(req.user?.id, onboardingPoints);
        }

        return res.status(200).json({
            message: "Onboarding updated successfully",
            awarded_points: onboardingPoints
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const upgradePlan = async (req, res) => {
    const { plan } = req.body;
    if (!['weekly', 'monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan type" });
    }

    try {
        let expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // 7 day trial
        if (plan === 'weekly') expiryDate.setDate(expiryDate.getDate() + 7);
        else if (plan === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
        else if (plan === 'yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const updated = await updateUserPlan(req.user?.id, plan, expiryDate);
        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: `Plan upgraded to ${plan}` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}