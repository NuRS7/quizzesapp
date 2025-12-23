import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../services/quiz.service';
import { Question, QuestionType, Quiz, QuizSettings } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz-creator',
  templateUrl: './quiz-creator.component.html',
  // FIX: Set change detection to OnPush for better performance.
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class QuizCreatorComponent {
  backToHome = output<void>();

  questions = signal<Question[]>([]);
  quizTitle = signal<string>('My New Quiz');
  timeLimit = signal<number>(300);
  pointsPerQuestion = signal<number>(10);
  shuffleQuestions = signal<boolean>(true);
  isDragging = signal<boolean>(false);
  error = signal<string | null>(null);

  // FIX: Use inject() instead of constructor injection.
  private quizService = inject(QuizService);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    if (file.type !== 'text/csv') {
      this.error.set('Invalid file type. Please upload a CSV file.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCSV(text);
    };
    reader.readAsText(file);
  }

  parseCSV(csvText: string) {
    this.error.set(null);
    const parsedQuestions: Question[] = [];
    const lines = csvText.split('\n').filter(line => line.trim() !== '');

    lines.forEach((line, index) => {
      try {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 2) throw new Error('Each row must have at least a question and one option.');

        const text = parts[0];
        const options = parts.slice(1).filter(opt => opt); // Filter out empty strings from trailing commas

        if (!text) throw new Error('Question text cannot be empty.');
        if (options.length === 0) throw new Error('At least one option must be provided.');

        const question: Question = {
          id: index + 1,
          text: text,
          options: options,
          correctAnswers: [],
          type: 'SINGLE', 
        };
        parsedQuestions.push(question);
      } catch (e: any) {
        this.error.set(`Error parsing line ${index + 1}: "${line}". Format: question,option1,option2,... Error: ${e.message}`);
        this.questions.set([]);
        return;
      }
    });

    if(!this.error()){
        this.questions.set(parsedQuestions);
    }
  }
  
  updateField(questionId: number, field: 'text' | 'option' | 'correctAnswers' | 'type', value: any, optionIndex?: number) {
      this.questions.update(qs => {
          const question = qs.find(q => q.id === questionId);
          if (!question) return qs;

          switch(field) {
              case 'text':
                  question.text = value;
                  break;
              case 'option':
                  if (optionIndex !== undefined) {
                      question.options[optionIndex] = value;
                  }
                  break;
              case 'type':
                  question.type = value;
                  if (value === 'TRUE_FALSE') {
                    question.options = ['True', 'False'];
                  }
                  question.correctAnswers = [];
                  break;
          }
          return [...qs];
      });
  }

  updateCorrectAnswer(questionId: number, event: Event, optionIndex: number) {
    const target = event.target as HTMLInputElement;
    this.questions.update(qs => {
        const question = qs.find(q => q.id === questionId);
        if (!question) return qs;

        if (question.type === 'SINGLE' || question.type === 'TRUE_FALSE') {
            question.correctAnswers = [optionIndex];
        } else { // MULTIPLE
            if (target.checked) {
                question.correctAnswers = [...question.correctAnswers, optionIndex].sort();
            } else {
                question.correctAnswers = question.correctAnswers.filter(i => i !== optionIndex);
            }
        }
        return [...qs];
    });
  }
  
  isCorrect(question: Question, optionIndex: number): boolean {
    return question.correctAnswers.includes(optionIndex);
  }

  generateHtmlQuiz() {
    if (this.questions().length === 0) {
      this.error.set('Cannot generate quiz with no questions.');
      return;
    }

    const hasIncompleteAnswers = this.questions().some(q => q.correctAnswers.length === 0);
    if(hasIncompleteAnswers) {
      this.error.set('Please select a correct answer for every question before generating the quiz.');
      return;
    }
    
    this.error.set(null);

    const quiz: Quiz = {
      title: this.quizTitle(),
      questions: this.questions(),
      settings: {
        timeLimit: this.timeLimit(),
        pointsPerQuestion: this.pointsPerQuestion(),
        shuffleQuestions: this.shuffleQuestions(),
      }
    };
    
    this.quizService.generateAndSetHtml(quiz);
  }
}
