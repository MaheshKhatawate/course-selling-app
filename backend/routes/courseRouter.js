import express from "express";
import { userMiddleware } from "../middleware/userMiddleware.js";
import { CourseModel, PurchaseModel } from "../models/models.js";

const courseRouter = express.Router()

courseRouter.post('/purchase', userMiddleware,async (req,res) => {
    const userId = req.userId;
    const courseId = req.body.courseId;


    await PurchaseModel.create({
        userId,
        courseId
    })

    res.json({
        message:"You have successfully got the course"
    })
})

courseRouter.get('/preview', async (req,res) => {
    const courses = await CourseModel.find({})

    res.json({
        courses
    })
})

export {courseRouter}