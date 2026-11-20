import { z } from "zod";

export const courseId = z.string().regex(/^[a-f\d]{24}$/i);
export const CourseCreateSchema = z.object({
    title: z.string().trim().min(1).max(140),
    description: z.string().trim().min(1).max(4000),
    price: z.number().min(0).max(1000000).multipleOf(0.01),
    imageUrl: z.union([z.literal(""), z.url({ protocol: /^https?$/ })]).optional(),
    category: z.enum(["Development", "Design", "Branding", "Other"]).optional()
});
export const CourseEditSchema = CourseCreateSchema.partial().extend({ courseId })
    .refine(data => Object.keys(data).length > 1, "Include a field to update");
