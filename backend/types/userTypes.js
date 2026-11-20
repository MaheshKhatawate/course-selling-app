import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(1);
const name = z.string().trim().min(1).max(80);
export const SignInSchema = z.object({ email, password });
export const SignUpSchema = SignInSchema.extend({
    password: password.min(8).refine(value => Buffer.byteLength(value) <= 72, "Use at most 72 password bytes"),
    firstName: name,
    lastName: name
});
