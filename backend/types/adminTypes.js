import * as z from "zod";

export const CourseCreateSchema = z.object({
    title: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
});

export const CourseEditSchema = z.object({
    courseId:z.string(),
    title:z.string()
});