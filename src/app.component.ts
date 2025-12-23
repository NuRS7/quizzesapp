import { Component, ChangeDetectionStrategy, signal, effect, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingComponent } from './components/landing/landing.component';
import { QuizCreatorComponent } from './components/quiz-creator/quiz-creator.component';
import { QuizPreviewComponent } from './components/quiz-preview/quiz-preview.component';
import { QuizService } from './services/quiz.service';

export type Page = 'landing' | 'create' | 'preview';
export type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LandingComponent,
    QuizCreatorComponent,
    QuizPreviewComponent
  ],
})
export class AppComponent {
  currentPage = signal<Page>('landing');
  theme = signal<Theme>('dark');
  
  // FIX: Use inject() instead of constructor injection for better practice.
  private renderer = inject(Renderer2);
  private quizService = inject(QuizService);

  constructor() {
    effect(() => {
      const html = this.quizService.generatedHtml();
      if (html) {
        this.currentPage.set('preview');
      }
    });

    effect(() => {
      if (this.theme() === 'dark') {
        this.renderer.addClass(document.documentElement, 'dark');
      } else {
        this.renderer.removeClass(document.documentElement, 'dark');
      }
    });
  }

  changePage(page: Page) {
    if (page === 'landing') {
      this.quizService.resetQuiz();
    }
    this.currentPage.set(page);
  }

  toggleTheme() {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  startDemoQuiz() {
    this.quizService.loadDemoQuiz();
  }
}
