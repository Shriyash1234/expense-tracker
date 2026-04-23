import { Badge } from "@/components/ui/badge";

type HeaderProps = {
  totalAmount: string;
  expenseCount: number;
};

const Header = ({ totalAmount, expenseCount }: HeaderProps) => {
  return (
    <header className="rounded-lg bg-zinc-950 px-6 py-5 text-white">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2.5">
            <h1 className="text-lg font-semibold tracking-tight">
              Expense Tracker
            </h1>
            <Badge
              variant="outline"
              className="border-zinc-700 text-[10px] font-medium uppercase tracking-widest text-zinc-400"
            >
              Personal
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Track spending with retry-safe submissions and live totals.
          </p>
        </div>

        <div className="shrink-0 rounded-md border border-zinc-800 bg-zinc-900 px-5 py-3 text-right">
          <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Visible Total
          </p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-emerald-500">
            {totalAmount}
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            {expenseCount} {expenseCount === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
