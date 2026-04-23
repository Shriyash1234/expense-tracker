import type { CreateExpenseResponse, ExpenseFormState, ExpenseListResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const buildUrl = (path: string) => new URL(path, API_BASE_URL).toString();

const readErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    return payload.message ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
};

type ListExpensesParams = {
  category: string;
  fromDate: string;
  toDate: string;
};

export const listExpenses = async ({
  category,
  fromDate,
  toDate,
}: ListExpensesParams): Promise<ExpenseListResponse> => {
  const url = new URL(buildUrl("/expenses"));

  if (category.trim()) {
    url.searchParams.set("category", category.trim());
  }

  if (fromDate) {
    url.searchParams.set("fromDate", fromDate);
  }

  if (toDate) {
    url.searchParams.set("toDate", toDate);
  }

  url.searchParams.set("sort", "date_desc");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
};

export const createExpense = async (
  payload: ExpenseFormState,
  idempotencyKey: string
): Promise<CreateExpenseResponse> => {
  const response = await fetch(buildUrl("/expenses"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
};
