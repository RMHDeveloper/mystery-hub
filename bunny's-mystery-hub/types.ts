export enum Genre {
  Murder = 'Murder',
  Theft = 'Theft',
  Cybercrime = 'Cybercrime',
  Kidnapping = 'Kidnapping',
  Forgery = 'Forgery',
  Espionage = 'Espionage',
  ColdCase = 'ColdCase',
}

export interface MysteryCase {
  title: string;
  scenes: string[];
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  hints: string[]; // Added for scene-specific hints
}