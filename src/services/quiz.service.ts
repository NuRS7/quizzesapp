
import { Injectable, signal, inject } from '@angular/core';
import { Quiz } from '../models/quiz.model';
import { QuizGeneratorService } from './quiz-generator.service';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private generatorService = inject(QuizGeneratorService);

  generatedHtml = signal<string | null>(null);

  generateAndSetHtml(quiz: Quiz) {
    const html = this.generatorService.generateQuizHtml(quiz);
    this.generatedHtml.set(html);
  }

  resetQuiz() {
    this.generatedHtml.set(null);
  }

  loadDemoQuiz() {
    const demoQuiz: Quiz = {
      title: "General Knowledge Demo",
      settings: { timeLimit: 300, pointsPerQuestion: 10, shuffleQuestions: true },
      questions: [
        { id: 1, text: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctAnswers: [2], type: 'SINGLE', explanation: "Paris is the capital and most populous city of France." },
        { id: 2, text: "Which of the following are primary colors (in the additive color model)?", options: ["Red", "Green", "Blue", "Yellow"], correctAnswers: [0, 1, 2], type: 'MULTIPLE', explanation: "The additive primary colors are Red, Green, and Blue (RGB)." },
        { id: 3, text: "The Earth is the center of the universe.", options: ["True", "False"], correctAnswers: [1], type: 'TRUE_FALSE', explanation: "The Earth revolves around the Sun, which is not the center of the universe." },
        { id: 4, text: "Who wrote 'Hamlet'?", options: ["Charles Dickens", "William Shakespeare", "Leo Tolstoy", "Mark Twain"], correctAnswers: [1], type: 'SINGLE', explanation: "'Hamlet' is a tragedy written by William Shakespeare sometime between 1599 and 1601." },
        { id: 5, text: "Which planets are gas giants?", options: ["Mars", "Jupiter", "Saturn", "Venus"], correctAnswers: [1, 2], type: 'MULTIPLE', explanation: "Jupiter and Saturn are the two largest planets and are known as gas giants." },
      ]
    };
    this.generateAndSetHtml(demoQuiz);
  }
}
