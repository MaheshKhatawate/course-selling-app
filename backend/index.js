import express from "express";
import { userRouter } from "./routes/userRouter.js";
import { courseRouter } from "./routes/courseRouter.js";
import { adminRouter } from "./routes/adminRouter.js"
import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv()

const app = express();
app.use(express.json());

app.use("/user", userRouter);
app.use("/course", courseRouter);
app.use("/admin", adminRouter)

mongoose.connect(process.env.MONGO_DB_URI).then(() => {
    console.log("Mongoose connected.")
    app.listen(3000, () => console.log(`Server running on port 3000`));
})