import { z } from "zod";

const CATEGORIES = [
  "housing","food","transport","entertainment","shopping",
  "health","education","utilities","salary","freelance",
  "investment","transfer","other",
] as const;

export const createBudgetSchema = z.object({
  category: z.enum(CATEGORIES),
  name: z.string().min(2, "Name required").max(60),
  limit: z.coerce.number().min(1, "Limit must be at least 1").max(10_000_000),
  period: z.enum(["weekly","monthly","yearly"]).default("monthly"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").default("#818cf8"),
  alertAt: z.coerce.number().min(0).max(100).default(80),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
