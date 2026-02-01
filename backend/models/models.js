import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email:{type:String, unique:true},
    password:String,
    firstName:String,
    lastName:String
});

const AdminSchema = new mongoose.Schema({
    email:{type:String, unique:true},
    password:String,
    firstName:String,
    lastName:String
});

const CourseSchema = new mongoose.Schema({
    title:String,
    description:String,
    price:Number,
    imageUrl:String,
    createrId:mongoose.Types.ObjectId
})

const PurchaseSchema = new mongoose.Schema({
    userId:mongoose.Types.ObjectId,
    courseId:mongoose.Types.ObjectId
})

export const UserModel = mongoose.model("user", UserSchema)
export const AdminModel = mongoose.model("admin", AdminSchema)
export const CourseModel = mongoose.model("course", CourseSchema)
export const PurchaseModel = mongoose.model("purchase", PurchaseSchema)