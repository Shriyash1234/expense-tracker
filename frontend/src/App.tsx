import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createExpense, listExpenses } from "./api";
import type { Expense, ExpenseFormState } from "./types";
import Header from "@/components/Header";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseTable from "@/components/ExpenseTable";
import { ALL_CATEGORIES_VALUE } from "@/categories";

const DRAFT_STORAGE_KEY = "expense-tracker-draft";

const getToday = () => new Date().toISOString().slice(0, 10);

const createEmptyForm = (): ExpenseFormState => ({
  amount: "",
  category: "Food",
  description: "",
  date: getToday(),
});

const createDraft = () => ({
  form: createEmptyForm(),
  idempotencyKey: crypto.randomUUID(),
});

const loadDraft = () => {
  const emptyDraft = createDraft();

  if (typeof window === "undefined") {
    return emptyDraft;
  }

  const storedValue = window.localStorage.getItem(DRAFT_STORAGE_KEY);

  if (!storedValue) {
    return emptyDraft;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as {
      form: ExpenseFormState;
      idempotencyKey: string;
    };

    return {
      form: {
        ...createEmptyForm(),
        ...parsedValue.form,
      },
      idempotencyKey: parsedValue.idempotencyKey || crypto.randomUUID(),
    };
  } catch {
    return emptyDraft;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount / 100);

const parseAmountToPaise = (amount: string) => {
  const [rupees = "0", paise = ""] = amount.split(".");
  return Number(rupees) * 100 + Number(`${paise}00`.slice(0, 2));
};

const isValidAmountInput = (value: string) => /^\d+(?:\.\d{1,2})?$/.test(value);

const getVisibleExpenses = (items: Expense[], sortOrder: "newest" | "oldest") =>
  sortOrder === "newest" ? items : [...items].reverse();

const App = () => {
  const queryClient = useQueryClient();
  const [{ form: initialForm, idempotencyKey: initialIdempotencyKey }] = useState(loadDraft);
  const [form, setForm] = useState<ExpenseFormState>(initialForm);
  const [idempotencyKey, setIdempotencyKey] = useState(initialIdempotencyKey);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_VALUE);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [submitError, setSubmitError] = useState("");

  const expensesQuery = useQuery({
    queryKey: ["expenses", categoryFilter],
    queryFn: () => listExpenses(categoryFilter === ALL_CATEGORIES_VALUE ? "" : categoryFilter),
  });

  const createExpenseMutation = useMutation({
    mutationFn: async () => createExpense(form, idempotencyKey),
    onSuccess: async () => {
      const nextDraft = createDraft();
      setForm(nextDraft.form);
      setIdempotencyKey(nextDraft.idempotencyKey);
      setSubmitError("");
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Unable to save expense.");
    },
  });

  useEffect(() => {
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({
        form,
        idempotencyKey,
      })
    );
  }, [form, idempotencyKey]);

  const visibleExpenses = useMemo(
    () => getVisibleExpenses(expensesQuery.data?.items ?? [], sortOrder),
    [expensesQuery.data?.items, sortOrder]
  );

  const totalAmount = useMemo(
    () =>
      visibleExpenses.reduce((sum, item) => {
        return sum + parseAmountToPaise(item.amount);
      }, 0),
    [visibleExpenses]
  );

  const updateField =
    (field: keyof ExpenseFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const amount = form.amount.trim();
    if (!isValidAmountInput(amount) || parseAmountToPaise(amount) <= 0) {
      setSubmitError("Amount must be a positive number with up to 2 decimal places.");
      return;
    }

    await createExpenseMutation.mutateAsync();
  };

  return (
    <main className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 sm:py-8">
      <Header
        totalAmount={formatCurrency(totalAmount)}
        expenseCount={visibleExpenses.length}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <ExpenseForm
          form={form}
          isPending={createExpenseMutation.isPending}
          submitError={submitError}
          onFieldChange={updateField}
          onCategoryChange={(category) =>
            setForm((current) => ({
              ...current,
              category,
            }))
          }
          onDateChange={(date) =>
            setForm((current) => ({
              ...current,
              date,
            }))
          }
          onSubmit={handleSubmit}
        />

        <ExpenseTable
          expenses={visibleExpenses}
          isLoading={expensesQuery.isLoading}
          isError={expensesQuery.isError}
          errorMessage={
            expensesQuery.error instanceof Error
              ? expensesQuery.error.message
              : "Unable to load expenses."
          }
          categoryFilter={categoryFilter}
          sortOrder={sortOrder}
          onCategoryFilterChange={setCategoryFilter}
          onSortOrderChange={setSortOrder}
          formatCurrency={formatCurrency}
          parseAmountToPaise={parseAmountToPaise}
        />
      </div>
    </main>
  );
};

export default App;
