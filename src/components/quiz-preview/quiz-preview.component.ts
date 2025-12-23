import { Component, ChangeDetectionStrategy, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz-preview',
  templateUrl: './quiz-preview.component.html',
  // FIX: Set change detection to OnPush for better performance.
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class QuizPreviewComponent {
  backToCreator = output<void>();
  backToHome = output<void>();

  // FIX: Explicitly type DomSanitizer to resolve type inference issue.
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private quizService = inject(QuizService);

  private htmlContent = this.quizService.generatedHtml;

  quizSrc = computed<SafeResourceUrl | null>(() => {
    const html = this.htmlContent();
    if (html) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      );
    }
    return null;
  });

  downloadHtml() {
    const html = this.htmlContent();
    if (!html) return;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  openInNewTab() {
    const html = this.htmlContent();
    if (!html) return;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // We can't revoke the URL immediately as the new tab needs it.
    // The browser will handle cleanup when the tab is closed.
  }
}
