import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

const secret = () => randomBytes(48).toString("hex");
try {
    writeFileSync(".env", `MONGO_DB_URI=mongodb://127.0.0.1:27017/fieldwork\nJWT_SECRET=${secret()}\nJWT_ADMIN_SECRET=${secret()}\nPORT=4000\n`, { flag: "wx", mode: 0o600 });
    console.log("Created backend/.env for local development.");
} catch (err) {
    if (err.code !== "EEXIST") throw err;
    console.log("Using existing backend/.env.");
}
