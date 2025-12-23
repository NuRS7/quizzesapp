
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswers: number[];
  type: QuestionType;
  explanation?: string;
}

export interface UserAnswer {
  questionId: number;
  selectedAnswers: number[];
}

export interface QuizSettings {
  timeLimit: number; // in seconds, 0 for no limit
  pointsPerQuestion: number;
  shuffleQuestions: boolean;
}

export interface Quiz {
  title: string;
  questions: Question[];
  settings: QuizSettings;
}
