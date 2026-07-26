import { acceptedAnswersFor, isAnswerCorrect, normalizeAnswer } from '@/lib/answerCheck';

describe('normalizeAnswer', () => {
  it('is case- and whitespace-insensitive', () => {
    expect(normalizeAnswer('  Shukran ')).toBe(normalizeAnswer('shukran'));
  });
  it('collapses transliteration spelling variants', () => {
    // choukran / shukraan / shukran should canonicalize together
    expect(normalizeAnswer('choukran')).toBe(normalizeAnswer('shukran'));
    expect(normalizeAnswer('shukraan')).toBe(normalizeAnswer('shukran'));
  });
  it('strips a leading article', () => {
    expect(normalizeAnswer('the house')).toBe(normalizeAnswer('house'));
  });
});

describe('isAnswerCorrect', () => {
  const accept = (correct: string, acceptedAnswers?: string[]) =>
    acceptedAnswersFor({ correctAnswer: correct, acceptedAnswers });

  it('accepts an exact answer', () => {
    expect(isAnswerCorrect('shukran', accept('shukran'))).toBe(true);
  });
  it('accepts common spelling variations', () => {
    expect(isAnswerCorrect('choukran', accept('shukran'))).toBe(true);
    expect(isAnswerCorrect('marhaba', accept('mar7aba'))).toBe(true);
  });
  it('accepts a small typo on longer words', () => {
    expect(isAnswerCorrect('marhabaa', accept('marhaba'))).toBe(true);
    expect(isAnswerCorrect('sabah alkhir', accept('sabah al kheir'))).toBe(true);
  });
  it('accepts any listed variation / synonym', () => {
    expect(isAnswerCorrect('hi', accept('hello / hi'))).toBe(true);
    expect(isAnswerCorrect('afwan', accept("you're welcome", ['afwan']))).toBe(true);
  });
  it('ignores a parenthetical qualifier', () => {
    expect(isAnswerCorrect('welcome', accept('welcome (formal)'))).toBe(true);
  });
  it('still rejects a genuinely different word', () => {
    expect(isAnswerCorrect('kitab', accept('bayt'))).toBe(false);
    expect(isAnswerCorrect('goodbye', accept('hello'))).toBe(false);
  });
  it('rejects empty input', () => {
    expect(isAnswerCorrect('', accept('shukran'))).toBe(false);
  });
});
