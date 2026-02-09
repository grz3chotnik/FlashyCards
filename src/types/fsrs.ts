import type { Card as FSRSCard, Rating, State } from 'ts-fsrs';
import type { CardModel as PrismaCard } from '../generated/prisma/models/Card';

export { Rating, State };

// Convert Prisma Card to FSRS Card format
export function toFSRSCard(card: PrismaCard): FSRSCard {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as State,
    last_review: card.lastReview ?? undefined,
    learning_steps: card.learningSteps,
  };
}

// Convert FSRS Card back to Prisma update format
export function toPrismaCard(fsrsCard: FSRSCard) {
  return {
    due: fsrsCard.due,
    stability: fsrsCard.stability,
    difficulty: fsrsCard.difficulty,
    elapsedDays: fsrsCard.elapsed_days,
    scheduledDays: fsrsCard.scheduled_days,
    reps: fsrsCard.reps,
    lapses: fsrsCard.lapses,
    state: fsrsCard.state,
    lastReview: fsrsCard.last_review,
    learningSteps: fsrsCard.learning_steps,
  };
}
