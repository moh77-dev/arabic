import React from 'react';
import { FlashcardExercise } from './exercises/FlashcardExercise';
import { GrammarTeachExercise } from './exercises/GrammarTeachExercise';
import { MultipleChoiceExercise } from './exercises/MultipleChoiceExercise';
import { SpeakingExercise } from './exercises/SpeakingExercise';
import { SpeedRoundExercise } from './exercises/SpeedRoundExercise';
import { TeachExercise } from './exercises/TeachExercise';
import { TypedAnswerExercise } from './exercises/TypedAnswerExercise';
import { WordOrderExercise } from './exercises/WordOrderExercise';
import type { Exercise, SRSGrade } from '@/types';

interface Props {
  exercise: Exercise;
  onAnswered: (correct: boolean) => void;
  onFlashcardGraded?: (grade: SRSGrade) => void;
}

/** Dispatches each exercise to the component that knows how to render/grade its type. */
export function ExerciseRenderer({ exercise, onAnswered, onFlashcardGraded }: Props) {
  switch (exercise.type) {
    case 'teach':
      return <TeachExercise exercise={exercise} onDone={() => onAnswered(true)} />;
    case 'grammar_teach':
      return <GrammarTeachExercise exercise={exercise} onDone={() => onAnswered(true)} />;
    case 'vocabulary':
    case 'listening':
    case 'matching':
    case 'picture_match':
    case 'translation_choice' as any:
      return <MultipleChoiceExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'typing':
    case 'translation':
      return <TypedAnswerExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'word_order':
      return <WordOrderExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'speed_round':
      return <SpeedRoundExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'speaking':
    case 'shadowing':
    case 'pronunciation':
      return <SpeakingExercise exercise={exercise} onAnswered={onAnswered} />;
    case 'flashcard':
      return <FlashcardExercise exercise={exercise} onGraded={onFlashcardGraded ?? (() => onAnswered(true))} />;
    default:
      return <MultipleChoiceExercise exercise={exercise} onAnswered={onAnswered} />;
  }
}
