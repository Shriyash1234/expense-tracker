import type { ChangeEvent, FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/DatePicker";
import { CATEGORY_ICONS, EXPENSE_CATEGORIES } from "@/categories";
import type { ExpenseFormState } from "@/types";

type ExpenseFormProps = {
  form: ExpenseFormState;
  isPending: boolean;
  submitError: string;
  onFieldChange: (field: keyof ExpenseFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCategoryChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const RequiredMarker = () => <span className="text-destructive">*</span>;

const ExpenseForm = ({ form, isPending, submitError, onFieldChange, onCategoryChange, onDateChange, onSubmit }: ExpenseFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Add Expense</CardTitle>
        <CardDescription>
          Your draft is saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="expense-amount">
              Amount <RequiredMarker />
            </Label>
            <Input
              id="expense-amount"
              type="number"
              inputMode="decimal"
              placeholder="123.45"
              value={form.amount}
              onChange={onFieldChange("amount")}
              min="0.01"
              step="0.01"
              onKeyDown={(event) => {
                // Prevent exponent/negative input on number fields (still validate on submit too).
                if (["e", "E", "+", "-"].includes(event.key)) {
                  event.preventDefault();
                }
              }}
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="expense-category">
              Category <RequiredMarker />
            </Label>
            <Select value={form.category} onValueChange={onCategoryChange} required>
              <SelectTrigger id="expense-category" className="h-9 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {(() => {
                      const CategoryIcon = CATEGORY_ICONS[category];

                      return (
                        <>
                          <CategoryIcon className="size-3.5 text-muted-foreground" />
                          {category}
                        </>
                      );
                    })()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="expense-description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="expense-description"
              rows={3}
              placeholder="Optional note, e.g. lunch with team"
              value={form.description}
              onChange={onFieldChange("description")}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 resize-none"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="expense-date">
              Date <RequiredMarker />
            </Label>
            <DatePicker
              id="expense-date"
              value={form.date}
              onChange={onDateChange}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={isPending}>
            {isPending ? "Saving..." : "Save Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
