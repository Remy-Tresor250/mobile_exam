
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health & Fitness',
  'Travel',
  'Education',
  'Personal Care',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];