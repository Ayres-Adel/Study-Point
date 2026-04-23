import { addUserPoints, findUserById } from "../models/userModel.js";
import { createPointHistory } from "../models/pointModel.js";

export const redeemReward = async (req, res) => {
    const { points, label } = req.body;
    if (typeof points !== "number" || points <= 0) {
        return res.status(400).json({ message: "points must be a positive number" });
    }

    try {
        const user = await findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.points < points) {
            return res.status(400).json({ message: "Insufficient points" });
        }

        await addUserPoints(req.user.id, -points);
        await createPointHistory(req.user.id, "redemption", label || "Reward redemption", -points);

        return res.status(200).json({
            message: "Reward redeemed successfully",
            redeemed_points: points
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
