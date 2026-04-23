import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ALL_CATEGORIES_VALUE, CATEGORY_ICONS, EXPENSE_CATEGORIES } from "@/categories";
import type { Expense } from "@/types";

type ExpenseTableProps = {
  expenses: Expense[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  categoryFilter: string;
  sortOrder: "newest" | "oldest";
  onCategoryFilterChange: (value: string) => void;
  onSortOrderChange: (value: "newest" | "oldest") => void;
  formatCurrency: (amount: number) => string;
  parseAmountToPaise: (amount: string) => number;
};

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-amber-50 text-amber-700 border-amber-200",
  travel: "bg-blue-50 text-blue-700 border-blue-200",
  shopping: "bg-pink-50 text-pink-700 border-pink-200",
  health: "bg-emerald-50 text-emerald-700 border-emerald-200",
  bills: "bg-red-50 text-red-700 border-red-200",
  entertainment: "bg-indigo-50 text-indigo-700 border-indigo-200",
  groceries: "bg-lime-50 text-lime-700 border-lime-200",
  education: "bg-cyan-50 text-cyan-700 border-cyan-200",
  rent: "bg-orange-50 text-orange-700 border-orange-200",
  other: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const getCategoryStyle = (category: string) => {
  const key = category.toLowerCase();
  return CATEGORY_COLORS[key] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
};

const ExpenseTable = ({
  expenses,
  isLoading,
  isError,
  errorMessage,
  categoryFilter,
  sortOrder,
  onCategoryFilterChange,
  onSortOrderChange,
  formatCurrency,
  parseAmountToPaise,
}: ExpenseTableProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Expenses</CardTitle>
            <CardDescription>
              Filter by category and review your spending.
            </CardDescription>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="filter-category" className="text-xs text-muted-foreground">
                Filter
              </Label>
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger id="filter-category" className="h-8 w-full min-[420px]:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES_VALUE}>All categories</SelectItem>
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
              <Label className="text-xs text-muted-foreground">Sort</Label>
              <Select value={sortOrder} onValueChange={onSortOrderChange}>
                <SelectTrigger className="h-8 w-full min-[420px]:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading expenses...
            </div>
          </div>
        ) : isError ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        ) : !expenses.length ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">No expenses found.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Add your first expense using the form.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="pr-4 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                    {expense.date}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const CategoryIcon =
                        CATEGORY_ICONS[expense.category as keyof typeof CATEGORY_ICONS];

                      return (
                    <Badge
                      variant="outline"
                      className={`gap-1.5 text-[11px] font-medium ${getCategoryStyle(expense.category)}`}
                    >
                      {CategoryIcon ? <CategoryIcon className="size-3" /> : null}
                      {expense.category}
                    </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="pr-4 text-right font-mono text-sm font-medium">
                    {formatCurrency(parseAmountToPaise(expense.amount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseTable;
