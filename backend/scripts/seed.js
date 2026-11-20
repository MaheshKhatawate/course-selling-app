import "dotenv/config";
import mongoose from "mongoose";
import { CourseModel } from "../models/models.js";

const samples = [
    ["Creative Coding with JavaScript", "Development", 39, "creative-coding", "Turn simple rules into generative artwork. Explore canvas drawing, color and motion as you build an interactive visual study in JavaScript."],
    ["Interface Design Foundations", "Design", 49, "interface-design", "Build a clear, usable interface from the first wireframe to a polished screen. Practice hierarchy, spacing and interaction through a hands-on design project."],
    ["Building a Visual Identity", "Branding", 35, "visual-identity", "Give a brand its own visual language. Develop a color palette, type system and signature mark, then bring them together in a compact brand guide."]
];

try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    for (const [i, [title, category, price, cover, description]] of samples.entries()) {
        await CourseModel.updateOne({ _id: 'fade0000000000000000000' + i }, {
            $setOnInsert: { title, category, price, description, imageUrl: '/covers/' + cover + '.jpg' }
        }, { upsert: true });
    }
    console.log("Demo catalog ready.");
} finally {
    await mongoose.disconnect();
}
