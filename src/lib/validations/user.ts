import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  currency: z.enum(["INR", "USD", "EUR"]).optional(),
  monthlyIncome: z.coerce.number().min(0).optional(),
  savingsGoal: z.coerce.number().min(0).optional(),
  onboardingComplete: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
