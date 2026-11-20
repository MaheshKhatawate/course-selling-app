import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { userRouter } from "./routes/userRouter.js";
import { courseRouter } from "./routes/courseRouter.js";
import { adminRouter } from "./routes/adminRouter.js";
import { UserModel, AdminModel, PurchaseModel } from "./models/models.js";

const app = express();
app.use(express.json());
app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter);
app.use((req, res) => res.status(404).json({ message: "Route unavailable." }));
app.use((err, req, res, next) => {
    if (err.status === 400 || err.status === 413) return res.status(err.status).json({ message: "Invalid request body." });
    console.error(err.message);
    res.status(500).json({ message: "The request could not be completed." });
});

try {
    const { JWT_SECRET, JWT_ADMIN_SECRET, MONGO_DB_URI, PORT = 4000 } = process.env;
    if (!JWT_SECRET || !JWT_ADMIN_SECRET || JWT_ADMIN_SECRET === JWT_SECRET || !MONGO_DB_URI) {
        throw new Error("Set MONGO_DB_URI and two distinct JWT secrets in backend/.env.");
    }
    await mongoose.connect(MONGO_DB_URI);
    await Promise.all([UserModel.init(), AdminModel.init(), PurchaseModel.init()]);
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
} catch (err) {
    console.error("API startup failed:", err.message);
    await mongoose.disconnect();
    process.exitCode = 1;
}
