import { authenticate } from "./auth.js";
export const userMiddleware = authenticate("JWT_SECRET");
