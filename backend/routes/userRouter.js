import express from "express";
import { CourseModel, PurchaseModel, UserModel } from "../models/models.js";
import { userMiddleware } from "../middleware/userMiddleware.js";
import { addAuthRoutes } from "./auth.js";

export const userRouter = express.Router();
addAuthRoutes(userRouter, UserModel, "JWT_SECRET");

userRouter.get("/purchases", userMiddleware, async (req, res) => {
    const purchases = await PurchaseModel.find({ userId: req.userId });
    const coursesData = await CourseModel.find({ _id: { $in: purchases.map(p => p.courseId) } });
    res.json({ purchases, coursesData });
});
