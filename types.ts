
export interface TriviaItem {
  id: string;
  name: string;
  proposedValue: number;
  actualValue: number;
  unit: string;
  context: string;
  fact: string;
  emoji: string;
}

export interface TriviaSet {
  id: number;
  topic: string;
  items: TriviaItem[];
}

export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  SUMMARY = 'SUMMARY'
}

export type UserGuess = 'HIGHER' | 'LOWER';

export interface UserResult {
  item: TriviaItem;
  guess: UserGuess;
  correct: boolean;
}
