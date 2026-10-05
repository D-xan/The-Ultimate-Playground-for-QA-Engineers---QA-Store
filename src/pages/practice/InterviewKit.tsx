import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { questions, TOPICS, topicSlug, type Topic, type Question } from '@/data/interviewQuestions';
import { useInterviewStore } from '@/store/useInterviewStore';

type Mode = 'list' | 'flashcards';

const chip = (active: boolean) =>
  `px-3 h-9 rounded-full border text-sm font-medium transition-colors ${
    active ? 'bg-primary text-stone-900 border-primary' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
  }`;

const inTopic = (topic: Topic | null): Question[] => (topic ? questions.filter((q) => q.topic === topic) : questions);

// Unknown cards first; the order is a snapshot so a card does not jump when it is marked.
const buildDeck = (topic: Topic | null): string[] => {
  const known = new Set(useInterviewStore.getState().known);
  const list = inTopic(topic);
  return [...list.filter((q) => !known.has(q.id)), ...list.filter((q) => known.has(q.id))].map((q) => q.id);
};

export default function InterviewKit() {
  const known = useInterviewStore((s) => s.known);
  const toggleKnown = useInterviewStore((s) => s.toggleKnown);
  const setKnown = useInterviewStore((s) => s.setKnown);
  const reset = useInterviewStore((s) => s.reset);

  const [topic, setTopic] = useState<Topic | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [deck, setDeck] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const filtered = inTopic(topic);
  const knownCount = filtered.filter((q) => known.includes(q.id)).length;

  const startDeck = (t: Topic | null) => {
    setDeck(buildDeck(t));
    setIndex(0);
    setRevealed(false);
  };

  const pickTopic = (t: Topic | null) => {
    setTopic(t);
    if (mode === 'flashcards') startDeck(t);
  };

  const switchMode = () => {
    const next: Mode = mode === 'list' ? 'flashcards' : 'list';
    setMode(next);
    if (next === 'flashcards') startDeck(topic);
  };

  const toggleOpen = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const answerCard = (isKnown: boolean) => {
    const card = questions.find((q) => q.id === deck[index]);
    if (card) setKnown(card.id, isKnown);
    setIndex((i) => i + 1);
    setRevealed(false);
  };

  const card = questions.find((q) => q.id === deck[index]);
  const finished = mode === 'flashcards' && index >= deck.length;

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Interview Kit</h1>
        <p className="text-slate-500">QA and SDET interview questions with answers. Browse by topic or drill with flashcards. Progress is saved in your browser.</p>
        <HintAccordion hints={[
          'Selenium: read every [data-testid="question"] and compare its data-topic attribute after clicking a topic chip.',
          'Playwright: click getByTestId("topic-playwright"), then use getByTestId("question").count() and assert the data-topic of each.',
          'Cypress: click #flashcard-mode, #show-answer, #mark-known, then reload and check #known-count still reads 1.',
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Practice</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button id="flashcard-mode" type="button" variant="outline" onClick={switchMode}>
            {mode === 'list' ? 'Switch to flashcards' : 'Switch to list'}
          </Button>
          <Button type="button" variant="outline" onClick={reset}>Reset progress</Button>
          <span className="text-sm text-slate-500">Current mode: {mode === 'list' ? 'List' : 'Flashcards'}</span>
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Questions</h2>
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter by topic">
          <button type="button" data-testid="topic-all" aria-pressed={topic === null} className={chip(topic === null)} onClick={() => pickTopic(null)}>All</button>
          {TOPICS.map((t) => (
            <button key={t} type="button" data-testid={`topic-${topicSlug(t)}`} aria-pressed={topic === t} className={chip(topic === t)} onClick={() => pickTopic(t)}>{t}</button>
          ))}
        </div>
        <p id="known-count" className="text-sm font-medium text-slate-600 mb-4">{knownCount} / {filtered.length} known</p>

        {mode === 'list' ? (
          <ul className="space-y-3">
            {filtered.map((q) => {
              const isOpen = open.has(q.id);
              return (
                <li key={q.id}>
                  <div data-testid="question" data-topic={q.topic} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span>{q.topic}</span><span aria-hidden="true">·</span><span>{q.level}</span>
                    </div>
                    <p className="font-semibold text-slate-900">{q.q}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <button type="button" className="text-sm font-medium text-primary hover:underline" aria-expanded={isOpen} onClick={() => toggleOpen(q.id)}>
                        {isOpen ? 'Hide answer' : 'Show answer'}
                      </button>
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={known.includes(q.id)} onChange={() => toggleKnown(q.id)} />
                        Mark as known
                      </label>
                    </div>
                    {isOpen && <p data-testid="answer" className="mt-3 text-slate-700 leading-relaxed">{q.a}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : finished ? (
          <div id="flashcard-done" className="rounded-xl border border-border p-6 text-center space-y-3">
            <p className="font-semibold text-slate-900">Round complete. {knownCount} / {filtered.length} known.</p>
            <Button id="restart-deck" type="button" onClick={() => startDeck(topic)}>Start another round</Button>
          </div>
        ) : card ? (
          <div id="flashcard" className="rounded-xl border border-border p-6 space-y-4">
            <p className="text-xs text-slate-500">Card {index + 1} of {deck.length} · {card.topic} · {card.level}</p>
            <p className="text-lg font-semibold text-slate-900">{card.q}</p>
            {revealed ? (
              <div id="flashcard-answer" className="rounded-lg bg-slate-50 p-4 text-slate-700 leading-relaxed">{card.a}</div>
            ) : (
              <Button id="show-answer" type="button" variant="outline" onClick={() => setRevealed(true)}>Show answer</Button>
            )}
            <div className="flex flex-wrap gap-3">
              <Button id="mark-known" type="button" onClick={() => answerCard(true)}>I knew it</Button>
              <Button id="mark-review" type="button" variant="outline" onClick={() => answerCard(false)}>Review again</Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">No questions in this filter.</p>
        )}
      </section>
    </div>
  );
}
