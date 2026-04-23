import { z } from "zod";

import { isValidAmountInput } from "../utils/money";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const getTodayDateValue = () => new Date().toISOString().slice(0, 10);

const expenseDateSchema = z
  .string()
  .trim()
  .regex(datePattern, "Date must use YYYY-MM-DD format.")
  .refine((value) => value <= getTodayDateValue(), {
    message: "Expense date cannot be in the future.",
  });

export const createExpenseSchema = z
  .object({
    amount: z
      .string()
      .trim()
      .refine((value) => isValidAmountInput(value), {
        message: "Amount must be a positive number with up to 2 decimal places.",
      }),
    category: z.string().trim().min(1, "Category is required.").max(50),
    description: z.string().trim().max(200).optional(),
    date: expenseDateSchema,
  })
  .transform((value) => ({
    ...value,
    description: value.description ?? "",
  }));

export const listExpensesQuerySchema = z
  .object({
    category: z.string().trim().optional(),
    sort: z.enum(["date_desc"]).optional(),
    fromDate: expenseDateSchema.optional(),
    toDate: expenseDateSchema.optional(),
  })
  .refine(
    (value) => !value.fromDate || !value.toDate || value.fromDate <= value.toDate,
    {
      message: "From date must be before or equal to to date.",
      path: ["fromDate"],
    }
  );

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
