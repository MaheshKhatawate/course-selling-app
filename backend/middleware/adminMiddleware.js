import { authenticate } from "./auth.js";
export const adminMiddleware = authenticate("JWT_ADMIN_SECRET");
