import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SignInSchema, SignUpSchema } from "../types/userTypes.js";

export function addAuthRoutes(router, Account, secretName) {
    router.post("/signup", async (req, res) => {
        const parsed = SignUpSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: "Enter a valid name, email and password (8 characters minimum, 72 bytes maximum)." });
        const password = await bcrypt.hash(parsed.data.password, 10);
        try {
            const { _id, email, firstName, lastName } = await Account.create({ ...parsed.data, password });
            res.status(201).json({ success: true, data: { _id, email, firstName, lastName } });
        } catch (err) {
            if (err.code !== 11000) throw err;
            res.status(409).json({ message: "An account with this email already exists." });
        }
    });
    router.post("/signin", async (req, res) => {
        const parsed = SignInSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password." });
        const account = await Account.findOne({ email: parsed.data.email })
            ?? (req.body.email !== parsed.data.email && await Account.findOne({ email: req.body.email }));
        if (!account || !await bcrypt.compare(parsed.data.password, account.password)) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        const token = jwt.sign({ id: account._id }, process.env[secretName], { expiresIn: "8h" });
        res.json({ token, firstName: account.firstName });
    });
}
