import {
  AppleIcon,
  BookOpenIcon,
  CarIcon,
  ClapperboardIcon,
  HeartPulseIcon,
  HomeIcon,
  MoreHorizontalIcon,
  PlaneIcon,
  ReceiptTextIcon,
  ShoppingBagIcon,
} from "lucide-react";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Groceries",
  "Travel",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Rent",
  "Other",
] as const;

export const ALL_CATEGORIES_VALUE = "all";

export const CATEGORY_ICONS = {
  Food: AppleIcon,
  Groceries: ShoppingBagIcon,
  Travel: PlaneIcon,
  Shopping: ShoppingBagIcon,
  Bills: ReceiptTextIcon,
  Health: HeartPulseIcon,
  Entertainment: ClapperboardIcon,
  Education: BookOpenIcon,
  Rent: HomeIcon,
  Other: MoreHorizontalIcon,
} satisfies Record<(typeof EXPENSE_CATEGORIES)[number], typeof CarIcon>;
