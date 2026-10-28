import { z } from 'zod';

// Long-term memory: short facts the user has told the assistant that stay true
// across conversations (goals, upcoming costs, preferences). Kept small and
// fully visible to the user, who can delete any of it.

export const MEMORY_LIMIT = 20;
const FACT_MAX_LENGTH = 160;

export function buildMemoryExtractionMessages({ existingFacts = [], message }) {
  return [
    {
      role: 'system',
      content: [
        'You maintain a short memory about a user of a personal finance app.',
        'From the USER MESSAGE, extract facts worth remembering in future conversations:',
        'financial goals, planned or upcoming expenses, income changes, obligations (loans, EMIs, rent), and stated preferences about advice.',
        'Rules:',
        '- Only facts the user states about themselves. Never infer, never include amounts you computed.',
        '- Skip questions, greetings, one-off curiosity and anything already in KNOWN FACTS.',
        '- Each fact is one short third-person sentence, e.g. "Saving for a ₹60,000 laptop by March 2027."',
        '- Never store passwords, account numbers, card numbers, OTPs or government IDs.',
        'Return JSON: {"facts": string[]}. Return {"facts": []} when nothing qualifies, which is most of the time.',
      ].join('\n'),
    },
    {
      role: 'user',
      content: `KNOWN FACTS:\n${existingFacts.map((fact) => `- ${fact.text}`).join('\n') || '(none)'}\n\nUSER MESSAGE:\n${message}`,
    },
  ];
}

const extractionSchema = z.object({ facts: z.array(z.string()) });

// Digits-only runs this long look like account, card or phone numbers.
const SENSITIVE = /\b\d{9,}\b|otp|password|pin\b|cvv|aadhaar|pan card/i;

export function parseMemoryCompletion(raw) {
  try {
    const cleaned = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = extractionSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) return [];
    return parsed.data.facts
      .map((fact) => fact.trim().replace(/\s+/g, ' '))
      .filter((fact) => fact.length >= 8 && fact.length <= FACT_MAX_LENGTH && !SENSITIVE.test(fact))
      .slice(0, 3);
  } catch {
    return [];
  }
}

const normalizeForCompare = (text) => text.toLowerCase().replace(/[^a-z0-9₹]+/g, ' ').trim();

// Adds new facts, skips near-duplicates, and keeps only the newest MEMORY_LIMIT.
export function mergeFacts(existing = [], incoming = [], { now = new Date(), makeId }) {
  const seen = new Set(existing.map((fact) => normalizeForCompare(fact.text)));
  const added = [];
  incoming.forEach((text) => {
    const key = normalizeForCompare(text);
    if (!key || seen.has(key)) return;
    seen.add(key);
    added.push({ id: makeId(), text, createdAt: now });
  });
  return { facts: [...existing, ...added].slice(-MEMORY_LIMIT), added };
}

export function conversationTitle(message) {
  const text = message.trim().replace(/\s+/g, ' ');
  return text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text;
}
