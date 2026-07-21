import { ALL_VOCAB } from '@/content/dialects';
import { ALL_LESSONS, ALL_UNITS, ELOUED_LESSONS, ELOUED_UNITS } from '@/content/lessonPaths';

describe('content integrity', () => {
  it('has no duplicate vocab ids', () => {
    const ids = ALL_VOCAB.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every vocab word has non-empty arabic, transliteration, and english', () => {
    for (const word of ALL_VOCAB) {
      expect(word.arabic.length).toBeGreaterThan(0);
      expect(word.transliteration.length).toBeGreaterThan(0);
      expect(word.english.length).toBeGreaterThan(0);
    }
  });

  it('El Oued is the most detailed dialect track', () => {
    const elouedWordCount = ALL_VOCAB.filter((w) => w.dialectId === 'algerian_eloued').length;
    const otherCounts = ALL_VOCAB.filter((w) => w.dialectId !== 'algerian_eloued').reduce<Record<string, number>>(
      (acc, w) => ({ ...acc, [w.dialectId]: (acc[w.dialectId] ?? 0) + 1 }),
      {},
    );
    for (const count of Object.values(otherCounts)) {
      expect(elouedWordCount).toBeGreaterThan(count);
    }
  });

  it('every lesson has at least one exercise with a positive xp reward', () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.exercises.length).toBeGreaterThan(0);
      for (const ex of lesson.exercises) {
        expect(ex.xpReward).toBeGreaterThan(0);
      }
    }
  });

  it('every unit references lessons that exist', () => {
    const lessonIds = new Set(ALL_LESSONS.map((l) => l.id));
    for (const unit of ALL_UNITS) {
      for (const lessonId of unit.lessonIds) {
        expect(lessonIds.has(lessonId)).toBe(true);
      }
    }
  });

  it('El Oued units are ordered starting at 0', () => {
    const orders = ELOUED_UNITS.map((u) => u.order).sort((a, b) => a - b);
    expect(orders[0]).toBe(0);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('El Oued track has multiple units and lessons', () => {
    expect(ELOUED_UNITS.length).toBeGreaterThanOrEqual(6);
    expect(ELOUED_LESSONS.length).toBeGreaterThanOrEqual(10);
  });
});
