import { z } from "zod";

import { isValidAmountInput } from "../utils/money";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const createExpenseSchema = z.object({
  amount: z
    .string()
    .trim()
    .refine((value) => isValidAmountInput(value), {
      message: "Amount must be a positive number with up to 2 decimal places.",
    }),
  category: z.string().trim().min(1, "Category is required.").max(50),
  description: z.string().trim().min(1, "Description is required.").max(200),
  date: z.string().trim().regex(datePattern, "Date must use YYYY-MM-DD format."),
});

export const listExpensesQuerySchema = z.object({
  category: z.string().trim().optional(),
  sort: z.enum(["date_desc"]).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
