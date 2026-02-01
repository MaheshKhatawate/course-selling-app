import * as z from "zod";

export const SignUpSchema = z.object({
    email:z.string(),
    password:z.string(),
    firstName:z.string(),
    lastName:z.string()
});

export const SignInSchema = z.object({
    email:z.string(),
    password:z.string() 
});
