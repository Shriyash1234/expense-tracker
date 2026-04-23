export type Expense = {
  id: string;
  amount: string;
  category: string;
  description: string;
  date: string;
  createdAt: string;
};

export type ExpenseListResponse = {
  items: Expense[];
};

export type CreateExpenseResponse = {
  item: Expense;
  replayed: boolean;
};

export type ExpenseFormState = {
  amount: string;
  category: string;
  description: string;
  date: string;
};
