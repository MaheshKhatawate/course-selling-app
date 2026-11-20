import express from "express";
import { AdminModel, CourseModel } from "../models/models.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { CourseCreateSchema, CourseEditSchema, courseId } from "../types/adminTypes.js";
import { addAuthRoutes } from "./auth.js";

export const adminRouter = express.Router();
addAuthRoutes(adminRouter, AdminModel, "JWT_ADMIN_SECRET");
adminRouter.use(adminMiddleware);
adminRouter.post("/create", async (req, res) => {
    const parsed = CourseCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Check course title, description, price and cover URL." });
    const course = await CourseModel.create({ ...parsed.data, createrId: req.userId });
    res.status(201).json({ message: "Course published.", courseId: course._id, course });
});
adminRouter.get("/course/bulk", async (req, res) => {
    const courses = await CourseModel.find({ createrId: req.userId, archived: { $ne: true } });
    res.json({ success: true, totalCourses: courses.length, courses });
});
adminRouter.put("/course", async (req, res) => {
    const parsed = CourseEditSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Check course fields and ID." });
    const { courseId: _id, ...fields } = parsed.data;
    const course = await CourseModel.findOneAndUpdate({ _id, createrId: req.userId, archived: { $ne: true } }, fields, { returnDocument: "after" });
    if (!course) return res.status(404).json({ message: "Course unavailable." });
    res.json({ success: true, message: "Changes saved.", course });
});
adminRouter.delete("/course/:id", async (req, res) => {
    if (!courseId.safeParse(req.params.id).success) return res.status(400).json({ message: "Invalid course ID." });
    const course = await CourseModel.findOneAndUpdate({ _id: req.params.id, createrId: req.userId, archived: { $ne: true } }, { archived: true });
    if (!course) return res.status(404).json({ message: "Course unavailable." });
    res.json({ message: "Course removed from catalog." });
});
