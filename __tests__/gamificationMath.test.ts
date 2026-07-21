import {
  computeStreak,
  coinsForLesson,
  lessonXpReward,
  levelFromTotalXp,
  xpForLevel,
} from '@/lib/gamificationMath';

describe('gamificationMath', () => {
  it('computes increasing xp requirements per level', () => {
    expect(xpForLevel(2)).toBeGreaterThan(xpForLevel(1));
    expect(xpForLevel(10)).toBeGreaterThan(xpForLevel(5));
  });

  it('derives level and progress from total xp', () => {
    const { level, xpIntoLevel, xpForNextLevel } = levelFromTotalXp(0);
    expect(level).toBe(1);
    expect(xpIntoLevel).toBe(0);
    expect(xpForNextLevel).toBe(xpForLevel(1));
  });

  it('rolls over into the next level once enough xp accrues', () => {
    const needed = xpForLevel(1);
    const { level, xpIntoLevel } = levelFromTotalXp(needed + 5);
    expect(level).toBe(2);
    expect(xpIntoLevel).toBe(5);
  });

  it('increments streak on a consecutive day and resets after a gap', () => {
    expect(computeStreak(null, 0, '2026-01-01')).toBe(1);
    expect(computeStreak('2026-01-01', 1, '2026-01-02')).toBe(2);
    expect(computeStreak('2026-01-01', 5, '2026-01-01')).toBe(5);
    expect(computeStreak('2026-01-01', 5, '2026-01-05')).toBe(1);
  });

  it('scales lesson xp reward by accuracy and applies perfect bonus', () => {
    const partial = lessonXpReward({ baseXp: 100, accuracy: 0.5 });
    const perfect = lessonXpReward({ baseXp: 100, accuracy: 1, perfectBonus: true });
    expect(partial).toBe(50);
    expect(perfect).toBe(125);
  });

  it('doubles xp during a double-xp event', () => {
    const normal = lessonXpReward({ baseXp: 100, accuracy: 1 });
    const doubled = lessonXpReward({ baseXp: 100, accuracy: 1, isDoubleXpEvent: true });
    expect(doubled).toBe(normal * 2);
  });

  it('never pays out coins below the accuracy floor', () => {
    expect(coinsForLesson(0)).toBe(3);
    expect(coinsForLesson(1)).toBe(10);
  });
});
