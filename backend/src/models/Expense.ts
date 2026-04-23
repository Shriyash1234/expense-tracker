import { Schema, model } from "mongoose";

export type ExpenseDocument = {
  amountPaise: number;
  category: string;
  categoryKey: string;
  description: string;
  date: string;
  createdAt: Date;
  idempotencyKey: string;
  requestFingerprint: string;
};

const expenseSchema = new Schema<ExpenseDocument>(
  {
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    categoryKey: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    requestFingerprint: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

expenseSchema.index({ categoryKey: 1, date: -1, createdAt: -1 });

export const ExpenseModel = model<ExpenseDocument>("Expense", expenseSchema);
