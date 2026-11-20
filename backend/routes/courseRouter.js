import express from "express";
import { userMiddleware } from "../middleware/userMiddleware.js";
import { CourseModel, PurchaseModel } from "../models/models.js";
import { courseId } from "../types/adminTypes.js";

export const courseRouter = express.Router();
courseRouter.get("/preview", async (_req, res) => {
    res.json({ courses: await CourseModel.find({ archived: { $ne: true } }).sort({ _id: 1 }) });
});
courseRouter.post("/purchase", userMiddleware, async (req, res) => {
    const parsed = courseId.safeParse(req.body?.courseId);
    if (!parsed.success) return res.status(400).json({ message: "Invalid course ID." });
    if (!await CourseModel.exists({ _id: parsed.data, archived: { $ne: true } })) {
        return res.status(404).json({ message: "Course unavailable." });
    }
    try {
        await PurchaseModel.create({ userId: req.userId, courseId: parsed.data });
        res.status(201).json({ message: "Course added to your library." });
    } catch (err) {
        if (err.code !== 11000) throw err;
        res.status(409).json({ message: "This course is already in your library." });
    }
});
