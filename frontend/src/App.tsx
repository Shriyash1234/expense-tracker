import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createExpense, listExpenses } from "./api";
import type { Expense, ExpenseFormState } from "./types";

const DRAFT_STORAGE_KEY = "expense-tracker-draft";

const getToday = () => new Date().toISOString().slice(0, 10);

const createEmptyForm = (): ExpenseFormState => ({
  amount: "",
  category: "",
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

const getVisibleExpenses = (items: Expense[], sortOrder: "newest" | "oldest") =>
  sortOrder === "newest" ? items : [...items].reverse();

const App = () => {
  const queryClient = useQueryClient();
  const [{ form: initialForm, idempotencyKey: initialIdempotencyKey }] = useState(loadDraft);
  const [form, setForm] = useState<ExpenseFormState>(initialForm);
  const [idempotencyKey, setIdempotencyKey] = useState(initialIdempotencyKey);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [submitError, setSubmitError] = useState("");

  const expensesQuery = useQuery({
    queryKey: ["expenses", categoryFilter],
    queryFn: () => listExpenses(categoryFilter),
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
    await createExpenseMutation.mutateAsync();
  };

  return (
    <main className="page">
      <section className="panel hero">
        <div>
          <p className="eyebrow">Personal finance</p>
          <h1>Expense Tracker</h1>
          <p className="hero-copy">
            Track day-to-day spending with retry-safe submissions, clear filtering, and a live total.
          </p>
        </div>
        <div className="total-card">
          <span>Visible total</span>
          <strong>{formatCurrency(totalAmount)}</strong>
        </div>
      </section>

      <section className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Add expense</h2>
            <p>Your draft stays safe if the request fails or the page refreshes.</p>
          </div>

          <label>
            Amount
            <input
              type="text"
              inputMode="decimal"
              placeholder="123.45"
              value={form.amount}
              onChange={updateField("amount")}
              required
            />
          </label>

          <label>
            Category
            <input
              type="text"
              placeholder="Food"
              value={form.category}
              onChange={updateField("category")}
              required
            />
          </label>

          <label>
            Description
            <textarea
              rows={3}
              placeholder="Lunch with team"
              value={form.description}
              onChange={updateField("description")}
              required
            />
          </label>

          <label>
            Date
            <input type="date" value={form.date} onChange={updateField("date")} required />
          </label>

          {submitError ? <p className="message error">{submitError}</p> : null}

          <button type="submit" disabled={createExpenseMutation.isPending}>
            {createExpenseMutation.isPending ? "Saving..." : "Save expense"}
          </button>
        </form>

        <section className="panel list-panel">
          <div className="toolbar">
            <div className="section-heading">
              <h2>Expenses</h2>
              <p>Filter by category and review the latest expenses first.</p>
            </div>

            <div className="toolbar-controls">
              <label>
                Filter by category
                <input
                  type="text"
                  placeholder="Food"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                />
              </label>

              <label>
                Sort
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>
          </div>

          {expensesQuery.isLoading ? <p className="message">Loading expenses...</p> : null}
          {expensesQuery.isError ? (
            <p className="message error">
              {expensesQuery.error instanceof Error
                ? expensesQuery.error.message
                : "Unable to load expenses."}
            </p>
          ) : null}

          {!expensesQuery.isLoading && !visibleExpenses.length ? (
            <p className="message">No expenses yet for the current view.</p>
          ) : null}

          {visibleExpenses.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th className="amount-cell">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.date}</td>
                      <td>{expense.category}</td>
                      <td>{expense.description}</td>
                      <td className="amount-cell">
                        {formatCurrency(parseAmountToPaise(expense.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
};

export default App;
