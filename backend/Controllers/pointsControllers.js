import { addUserPoints, findUserById, setUserStreakAndLoginDate } from "../models/userModel.js";
import {
    createPointHistory,
    getTodayEarnedPoints,
    listLeaderboard,
    listPointHistoryByUser
} from "../models/pointModel.js";

const DAILY_POINTS_CAP = Number(process.env.DAILY_POINTS_CAP ?? 100);

export const addPoints = async (req, res) => {
    const { type, label, amount } = req.body;
    if (!type || !label || !amount ) {
        return res.status(400).json({ message: "type, label and numeric amount are required" });
    }

    if (amount <= 0) {
        return res.status(400).json({ message: "amount must be greater than 0" });
    }

    try {
        const todayEarned = await getTodayEarnedPoints(req.user.id);
        console.log(todayEarned);
        if (todayEarned + amount > DAILY_POINTS_CAP) {
            return res.status(400).json({
                message: "Daily points cap exceeded",
                daily_cap: DAILY_POINTS_CAP,
                earned_today: todayEarned
            });
        } 

        await addUserPoints(req.user.id, amount);
        await createPointHistory(req.user.id, type, label, amount);

        return res.status(200).json({ message: "Points added successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPointsHistory = async (req, res) => {
    try {
        const history = await listPointHistoryByUser(req.user.id);
        return res.status(200).json({ history });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getLeaderboard = async (_req, res) => {
    try {
        const leaderboard = await listLeaderboard();
        return res.status(200).json({ leaderboard });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const checkStreak = async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const today = new Date().toISOString().slice(0, 10);
        const lastLogin = user.last_login_date
            ? new Date(user.last_login_date).toISOString().slice(0, 10)
            : null;

        if (lastLogin === today) {
            return res.status(200).json({ streak: user.streak, updated: false });
        }

        let nextStreak = 1;
        if (lastLogin) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
            nextStreak = lastLogin === yesterday ? user.streak + 1 : 1;
        }

        await setUserStreakAndLoginDate(req.user.id, nextStreak, today);
        return res.status(200).json({ streak: nextStreak, updated: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
