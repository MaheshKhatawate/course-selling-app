import express from "express";
import {CourseModel, PurchaseModel, UserModel} from "../models/models.js"
import bcrypt from "bcryptjs"

// Types
import { SignUpSchema, SignInSchema } from "../types/userTypes.js";
import jwt from "jsonwebtoken"
import { userMiddleware } from "../middleware/userMiddleware.js";

const userRouter = express.Router()

userRouter.post("/signup", async (req,res) => {
    const {success, data} = SignUpSchema.safeParse(req.body);
    if(!success){
        res.status(413).json({
            message:"Invalid body.",
            success:false
        })
        return;
    }

    const user = await UserModel.findOne({
        email:data.email
    })

    if(user){
        res.status(400).json({
            success:false,
            message:"User already exist with mail."
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(data.password,5);

    const userDb = await UserModel.create({
        email:data.email,
        password:hashedPassword,
        firstName:data.firstName,
        lastName:data.lastName
    });

    res.status(201).json({
        success:true,
        data:{
            _id:userDb._id,
            email:userDb.email,
            firstName:userDb.firstName,
            lastName:userDb.lastName
        }
    })
    return;
})

userRouter.post("/signin", async (req,res) => {
    const {success, data} = SignInSchema.safeParse(req.body);

    if(!success){
        res.status(413).json({
            message:"Invalid body.",
            success:false
        })
        return;
    }

    const userdb = await UserModel.findOne({
        email:data.email
    });

    if(!userdb){
        res.status(400).json({
            success:false,
            message:"Invalid email or password"
        })
        return;
    }

    const checkPassword = await bcrypt.compare(data.password, userdb.password);
    if(!checkPassword){
        res.status(400).json({
            success:false,
            message:"Invalid email or password"
        })
        return;
    }

    const token = jwt.sign({
        id:userdb._id
    }, process.env.JWT_SECRET); 

    return res.status(200).json({
        token:token
    });

})


userRouter.get("/purchases", userMiddleware, async (req,res) => {
    const userId = req.userId;
    
    const purchases = await PurchaseModel.find({
        userId
    })

    const courses = await CourseModel.find({
        _id: { $in: purchases.map(x => x.courseId) }
    })

    return res.json({
        purchases,
        coursesData:courses
    })
})

export {userRouter}