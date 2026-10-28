import { describe, expect, it } from 'vitest';
import { MEMORY_LIMIT, buildMemoryExtractionMessages, conversationTitle, mergeFacts, parseMemoryCompletion } from './memory.js';

let counter = 0;
const makeId = () => `id-${(counter += 1)}`;

describe('parseMemoryCompletion', () => {
  it('returns cleaned facts from JSON', () => {
    expect(parseMemoryCompletion('{"facts": ["  Saving for a ₹60,000 laptop by March 2027. "]}')).toEqual([
      'Saving for a ₹60,000 laptop by March 2027.',
    ]);
  });

  it('drops anything that looks like a credential or account number', () => {
    const raw = JSON.stringify({ facts: ['Account number is 123456789012', 'Their UPI PIN is 4321', 'Pays rent of ₹12,000 monthly.'] });
    expect(parseMemoryCompletion(raw)).toEqual(['Pays rent of ₹12,000 monthly.']);
  });

  it('returns an empty list for malformed output', () => {
    expect(parseMemoryCompletion('sure! here are the facts')).toEqual([]);
    expect(parseMemoryCompletion('{"facts": "one"}')).toEqual([]);
  });

  it('caps a single extraction at three facts', () => {
    const raw = JSON.stringify({ facts: ['Fact number one.', 'Fact number two.', 'Fact number three.', 'Fact number four.'] });
    expect(parseMemoryCompletion(raw)).toHaveLength(3);
  });
});

describe('mergeFacts', () => {
  const now = new Date(2026, 9, 28);

  it('skips near-duplicates regardless of case and punctuation', () => {
    const existing = [{ id: 'a', text: 'Saving for a laptop.', createdAt: now }];
    const { facts, added } = mergeFacts(existing, ['saving for a LAPTOP', 'Has a bike EMI of ₹3,000.'], { now, makeId });
    expect(added.map((fact) => fact.text)).toEqual(['Has a bike EMI of ₹3,000.']);
    expect(facts).toHaveLength(2);
  });

  it('keeps only the newest facts once over the limit', () => {
    const existing = Array.from({ length: MEMORY_LIMIT }, (_, index) => ({ id: `e${index}`, text: `Old fact ${index}`, createdAt: now }));
    const { facts } = mergeFacts(existing, ['A brand new fact.'], { now, makeId });
    expect(facts).toHaveLength(MEMORY_LIMIT);
    expect(facts[0].id).toBe('e1');
    expect(facts.at(-1).text).toBe('A brand new fact.');
  });
});

describe('buildMemoryExtractionMessages', () => {
  it('lists known facts so the model does not repeat them', () => {
    const [, user] = buildMemoryExtractionMessages({ existingFacts: [{ text: 'Saving for a laptop.' }], message: 'hello' });
    expect(user.content).toContain('- Saving for a laptop.');
    expect(user.content).toContain('USER MESSAGE:\nhello');
  });
});

describe('conversationTitle', () => {
  it('collapses whitespace and truncates long messages', () => {
    expect(conversationTitle('  how   did I do  ')).toBe('how did I do');
    expect(conversationTitle('x'.repeat(100))).toHaveLength(58);
  });
});
