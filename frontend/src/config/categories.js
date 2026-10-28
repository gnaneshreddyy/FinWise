// Display labels for the categories in core/schemas.js. Split by direction so the
// form only offers categories that make sense for money in or money out.
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & dining' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'bills', label: 'Bills & utilities' },
  { value: 'rent', label: 'Rent' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

export const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'refund', label: 'Refund' },
  { value: 'other', label: 'Other' },
];

const LABELS = new Map([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((item) => [item.value, item.label]));

export function categoryLabel(value) {
  if (!value) return 'Other';
  return LABELS.get(value) || value.charAt(0).toUpperCase() + value.slice(1);
}
