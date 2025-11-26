export interface QuestionOption {
  text: string;
}

export interface Feedback {
  correct: string;
  incorrect: string;
}

export interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  feedback: Feedback;
}

export interface TextContent {
  title: string;
  body: string;
}

export interface MetaData {
  theme: string;
  level_erk: string;
  difficulty: number;
  language: string;
}

export interface LessonData {
  id: string;
  meta: MetaData;
  text_content: TextContent;
  questions: Question[];
  context_questions?: string[];
  isGenerated?: boolean;
}

export type ScreenState = 'DASHBOARD' | 'LESSON';

export interface Message {
  role: 'user' | 'model';
  text: string;
}