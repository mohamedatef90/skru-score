export interface Player {
  id: string;
  name: string;
  scores: number[]; // Scores for each round
}

export interface Match {
  id: string;
  winner: string;
  totals: { name: string; score: number }[];
  date: string;
}
