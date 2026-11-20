import mongoose from "mongoose";

const account = {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String
};
const courseSchema = new mongoose.Schema({
    title: String, description: String, price: Number, imageUrl: String,
    category: { type: String, default: "Other" },
    // Keep the original database field for existing courses.
    createrId: mongoose.Types.ObjectId,
    archived: { type: Boolean, default: false }
});
const purchaseSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    courseId: { type: mongoose.Types.ObjectId, required: true }
}, { timestamps: true });
purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserModel = mongoose.model("user", new mongoose.Schema(account));
export const AdminModel = mongoose.model("admin", new mongoose.Schema(account));
export const CourseModel = mongoose.model("course", courseSchema);
export const PurchaseModel = mongoose.model("purchase", purchaseSchema);
