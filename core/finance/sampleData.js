import { toDateKey } from './dates.js';

// Deterministic sample history for demos: three months of a young professional
// in an Indian city, including the small UPI payments real users make all day.

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const MONTHLY_FIXED = [
  { day: 1, amount: 42000, category: 'salary', description: 'Salary credit' },
  { day: 3, amount: -12000, category: 'rent', description: 'Rent' },
  { day: 6, amount: -1180, category: 'bills', description: 'Electricity bill' },
  { day: 9, amount: -649, category: 'bills', description: 'Broadband' },
  { day: 12, amount: -299, category: 'bills', description: 'Mobile recharge' },
  { day: 15, amount: -199, category: 'entertainment', description: 'Spotify' },
  { day: 18, amount: -649, category: 'entertainment', description: 'Netflix' },
];

const FREQUENT = [
  { perWeek: 6, min: 20, max: 60, category: 'food', descriptions: ['Chai', 'Tea and samosa', 'Coffee'] },
  { perWeek: 4, min: 40, max: 180, category: 'transport', descriptions: ['Auto', 'Metro card top-up', 'Bike taxi'] },
  { perWeek: 2, min: 280, max: 650, category: 'food', descriptions: ['Swiggy', 'Zomato', 'Dinner out'] },
  { perWeek: 1, min: 900, max: 2200, category: 'groceries', descriptions: ['Blinkit', 'Zepto', 'Supermarket'] },
];

const OCCASIONAL = [
  { chance: 0.6, min: 1200, max: 3500, category: 'shopping', descriptions: ['Myntra order', 'Amazon order'] },
  { chance: 0.4, min: 300, max: 900, category: 'entertainment', descriptions: ['Movie tickets', 'Bowling'] },
  { chance: 0.3, min: 400, max: 1500, category: 'health', descriptions: ['Pharmacy', 'Doctor visit'] },
  { chance: 0.25, min: 3000, max: 8000, category: 'freelance', descriptions: ['Freelance payment'], income: true },
];

export function generateSampleTransactions({ now = new Date(), months = 3, seed = 7 } = {}) {
  const random = seededRandom(seed);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const between = (min, max) => Math.round(min + random() * (max - min));
  const rows = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const lastDay = offset === 0 ? now.getDate() : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
    const at = (day, hour = 10 + Math.floor(random() * 11)) => {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day, hour, Math.floor(random() * 60));
      return `${toDateKey(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    MONTHLY_FIXED.filter((item) => item.day <= lastDay).forEach((item) => {
      rows.push({ rawDate: at(item.day, 9), amount: item.amount, category: item.category, description: item.description });
    });

    const weeks = lastDay / 7;
    FREQUENT.forEach((item) => {
      const count = Math.round(item.perWeek * weeks);
      for (let index = 0; index < count; index += 1) {
        rows.push({
          rawDate: at(between(1, lastDay)),
          amount: -between(item.min, item.max),
          category: item.category,
          description: pick(item.descriptions),
        });
      }
    });

    OCCASIONAL.forEach((item) => {
      if (random() > item.chance * (lastDay / 30)) return;
      const amount = between(item.min, item.max);
      rows.push({
        rawDate: at(between(1, lastDay)),
        amount: item.income ? amount : -amount,
        category: item.category,
        description: pick(item.descriptions),
      });
    });
  }

  return rows.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
}
