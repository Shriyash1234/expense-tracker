import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { config } from "./config";
import { ExpenseModel } from "./models/Expense";
import { createRequestFingerprint } from "./utils/fingerprint";
import { formatPaiseToAmount, parseAmountToPaise } from "./utils/money";
import { createExpenseSchema, listExpensesQuerySchema } from "./validation/expense";

const serializeExpense = (expense: {
  id: string;
  amountPaise: number;
  category: string;
  description: string;
  date: string;
  createdAt: Date;
}) => ({
  id: expense.id,
  amount: formatPaiseToAmount(expense.amountPaise),
  category: expense.category,
  description: expense.description,
  date: expense.date,
  createdAt: expense.createdAt.toISOString(),
});

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
    })
  );
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.post("/expenses", async (request, response, next) => {
    try {
      const idempotencyKey = request.header("Idempotency-Key")?.trim();

      if (!idempotencyKey) {
        response.status(400).json({
          error: "missing_idempotency_key",
          message: "Idempotency-Key header is required.",
        });
        return;
      }

      const parsedBody = createExpenseSchema.parse(request.body);
      const amountPaise = parseAmountToPaise(parsedBody.amount);
      const category = parsedBody.category.trim();
      const description = parsedBody.description.trim();
      const date = parsedBody.date.trim();
      const categoryKey = normalizeCategoryKey(category);
      const requestFingerprint = createRequestFingerprint({
        amountPaise,
        categoryKey,
        description,
        date,
      });

      const existingExpense = await ExpenseModel.findOne({ idempotencyKey });

      if (existingExpense) {
        if (existingExpense.requestFingerprint !== requestFingerprint) {
          response.status(409).json({
            error: "idempotency_key_conflict",
            message: "This idempotency key has already been used for a different request.",
          });
          return;
        }

        response.status(200).json({
          item: serializeExpense(existingExpense),
          replayed: true,
        });
        return;
      }

      try {
        const createdExpense = await ExpenseModel.create({
          amountPaise,
          category,
          categoryKey,
          description,
          date,
          idempotencyKey,
          requestFingerprint,
        });

        response.status(201).json({
          item: serializeExpense(createdExpense),
          replayed: false,
        });
        return;
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === 11000
        ) {
          const replayedExpense = await ExpenseModel.findOne({ idempotencyKey });

          if (replayedExpense) {
            if (replayedExpense.requestFingerprint !== requestFingerprint) {
              response.status(409).json({
                error: "idempotency_key_conflict",
                message: "This idempotency key has already been used for a different request.",
              });
              return;
            }

            response.status(200).json({
              item: serializeExpense(replayedExpense),
              replayed: true,
            });
            return;
          }
        }

        throw error;
      }
    } catch (error) {
      next(error);
    }
  });

  app.get("/expenses", async (request, response, next) => {
    try {
      const query = listExpensesQuerySchema.parse(request.query);
      const filter = query.category
        ? {
            categoryKey: normalizeCategoryKey(query.category),
          }
        : {};

      const items = await ExpenseModel.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .exec();

      response.json({
        items: items.map((item) => serializeExpense(item)),
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        error: "validation_error",
        message: error.issues[0]?.message ?? "Invalid request.",
      });
      return;
    }

    response.status(500).json({
      error: "internal_server_error",
      message: "Something went wrong.",
    });
  });

  return app;
};
