import jwt from "jsonwebtoken";

export function authenticate(secretName) {
    return (req, res, next) => {
        const token = req.get("authorization")?.replace(/^Bearer /i, "") || req.get("token");
        try {
            req.userId = jwt.verify(token, process.env[secretName], { algorithms: ["HS256"] }).id;
        } catch {
            return res.status(401).json({ message: "Sign in to continue." });
        }
        next();
    };
}
