import { describe, it, expect } from 'vitest';
import { questions, TOPICS, topicSlug } from './interviewQuestions';

describe('interview questions', () => {
  it('has at least 60 questions with unique ids', () => {
    expect(questions.length).toBeGreaterThanOrEqual(60);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });
  it('has at least 8 questions per topic', () => {
    for (const t of TOPICS) expect(questions.filter((q) => q.topic === t).length).toBeGreaterThanOrEqual(8);
  });
  it('has no empty question or answer', () => {
    for (const q of questions) { expect(q.q.trim()).not.toBe(''); expect(q.a.trim().length).toBeGreaterThan(40); }
  });
  it('slugs topics', () => {
    expect(topicSlug('Manual & Process')).toBe('manual-process');
    expect(topicSlug('API Testing')).toBe('api-testing');
    expect(topicSlug('Framework Design')).toBe('framework-design');
  });
  it('keeps the corrected technical details', () => {
    const a = (id: string) => questions.find((q) => q.id === id)!.a;
    expect(a('pw-1')).toMatch(/click[^.]*enabled/i);
    expect(a('pw-1')).toMatch(/editable/i);
    expect(a('cy-12')).toMatch(/subdomain|origin \(scheme, host or port\)/i);
  });
});
