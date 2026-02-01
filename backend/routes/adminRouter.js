import express from "express";
import { AdminModel, CourseModel } from "../models/models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {SignInSchema, SignUpSchema} from "../types/userTypes.js"
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { CourseCreateSchema, CourseEditSchema } from "../types/adminTypes.js";


const adminRouter = express.Router()

adminRouter.post("/signup", async (req, res) => {
    const { success, data } = SignUpSchema.safeParse(req.body);
    if (!success) {
        res.status(413).json({
            message: "Invalid body.",
            success: false
        })
        return;
    }

    const user = await AdminModel.findOne({
        email: data.email
    })

    if (user) {
        res.status(400).json({
            success: false,
            message: "User already exist with mail."
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 5);

    const userDb = await AdminModel.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName
    });

    res.status(201).json({
        success: true,
        data: {
            _id: userDb._id,
            email: userDb.email,
            firstName: userDb.firstName,
            lastName: userDb.lastName
        }
    })
    return;
})

adminRouter.post("/signin", async (req, res) => {
    const { success, data } = SignInSchema.safeParse(req.body);

    if (!success) {
        res.status(413).json({
            message: "Invalid body.",
            success: false
        })
        return;
    }

    const  userdb = await AdminModel.findOne({
        email: data.email
    });

    if (!userdb) {
        res.status(400).json({
            success: false,
            message: "Invalid email or password"
        })
        return;
    }

    const checkPassword = await bcrypt.compare(data.password, userdb.password);
    if (!checkPassword) {
        res.status(400).json({
            success: false,
            message: "Invalid email or password"
        })
        return;
    }

    const token = jwt.sign({
        id: userdb._id
    }, process.env.JWT_ADMIN_SECRET);

    return res.status(200).json({
        token: token
    });
})

adminRouter.post("/create", adminMiddleware, async (req, res) => {
    const adminId=req.userId;

    const {success, data} = CourseCreateSchema.safeParse(req.body);

    if(!success){
        return res.status(403).json({
            success:false,
            message:"Invalid inputs"
        })
    }

    const coursedb = await CourseModel.create({
        title:data.title,
        description:data.description,
        price:data.price,
        imageUrl:data.imageUrl,
        createrId:adminId
    });

    return res.status(200).json({
        message:"Course created",
        courseId:coursedb._id
    })
})

adminRouter.get('/course/bulk', adminMiddleware, async (req, res) => {
    const adminId = req.userId;

    const courses = await CourseModel.find({
        createrId:adminId
    });

    if(!courses){
        res.status(400).json({
            success: false,
            message: "You have not created any courses yet."
        });
        return;
    }

    return res.status(200).json({
        success: true,
        message : "Courses fetched successful",
        totalCourses:courses.length,
        courses: courses
    });
})

adminRouter.put('/course', adminMiddleware,async (req, res) => {
    const adminId = req.userId;

    const {success, data} = CourseEditSchema.safeParse(req.body);

    if(!success){
        return res.status(403).json({
            success:false,
            message:"Invalid inputs"
        })
    }

    const course = await CourseModel.findOne({
        createrId: adminId,
        _id:data.courseId
    });

    if(!course){
        return res.status(403).json({
            success:false,
            message:"No course found"
        });
    }

    course.title = data.title,
    await course.save();

    return res.status(200).json({
        success:true,
        message:"Course title saved successfully",
        course
    })
})

export { adminRouter }