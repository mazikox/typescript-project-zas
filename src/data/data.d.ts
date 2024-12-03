export interface Test {
  title: string;
  questions: Question[];
}

interface Question {
  question: string;
  timeSpend: number;
  correctAnswer: string;
  answers: Answers[];
}

interface Answers {
  content: string;
  id: string;
}
