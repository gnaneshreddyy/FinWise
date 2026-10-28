// Date helpers that never go through UTC. Transactions are stored as local
// calendar dates ("YYYY-MM-DD"), so a 1 AM payment in India stays on the right day.

const DATE_KEY = /^\d{4}-\d{2}-\d{2}/;

function pad(value) {
  return String(value).padStart(2, '0');
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toTimeKey(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Value for <input type="datetime-local">, in local time.
export function toDateTimeInputValue(date = new Date()) {
  return `${toDateKey(date)}T${toTimeKey(date)}`;
}

// Accepts "YYYY-MM-DD", "YYYY-MM-DDTHH:mm", a full ISO string or a Date.
// Returns the local calendar date key, or null when unparseable.
export function normalizeDateKey(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : toDateKey(value);
  }
  if (typeof value !== 'string' || !value) return null;

  // Plain date or local datetime: take the date part as written.
  if (DATE_KEY.test(value) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : toDateKey(parsed);
}

export function monthKeyOf(dateKey) {
  return dateKey ? dateKey.slice(0, 7) : null;
}

export function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${pad(shifted.getMonth() + 1)}`;
}

export function daysInMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}
