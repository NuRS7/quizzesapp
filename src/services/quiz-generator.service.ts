
import { Injectable } from '@angular/core';
import { Quiz } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizGeneratorService {

  generateQuizHtml(quiz: Quiz): string {
    const quizDataJson = JSON.stringify(quiz);

    return `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quiz.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class'
    }
  </script>
  <style>
    body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    .fade-in-up {
      animation: fade-in-up 0.5s ease-out forwards;
    }
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .fade-out-down {
      animation: fade-out-down 0.5s ease-in forwards;
    }
    @keyframes fade-out-down {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(20px); }
    }
  </style>
</head>
<body class="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">

  <main id="quiz-container" class="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
    <!-- Quiz Player View -->
    <div id="player-view">
      <!-- Header is rendered here -->
      <!-- Question is rendered here -->
    </div>

    <!-- Results View -->
    <div id="results-view" class="hidden">
      <!-- Results are rendered here -->
    </div>
  </main>
  
  <script id="quiz-data" type="application/json">${quizDataJson}</script>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const quizDataEl = document.getElementById('quiz-data');
      if (!quizDataEl) {
        console.error('Quiz data not found!');
        return;
      }

      const quizData = JSON.parse(quizDataEl.textContent);
      
      let questions = quizData.questions;
      if (quizData.settings.shuffleQuestions) {
        questions = [...questions].sort(() => Math.random() - 0.5);
      }

      const state = {
        questions,
        currentQuestionIndex: 0,
        userAnswers: [], // { questionId: number, selectedAnswers: number[] }
        timeRemaining: quizData.settings.timeLimit,
        timerInterval: null,
      };

      const playerView = document.getElementById('player-view');
      const resultsView = document.getElementById('results-view');

      function startTimer() {
        if (quizData.settings.timeLimit <= 0) return;
        
        const timerEl = document.getElementById('timer');
        if(!timerEl) return;

        state.timerInterval = setInterval(() => {
          state.timeRemaining--;
          const minutes = Math.floor(state.timeRemaining / 60);
          const seconds = state.timeRemaining % 60;
          timerEl.textContent = \`\${minutes}:\${seconds < 10 ? '0' : ''}\${seconds}\`;
          
          if (state.timeRemaining <= 0) {
            clearInterval(state.timerInterval);
            finishQuiz();
          }
        }, 1000);
      }

      function renderHeader() {
          const timeDisplay = quizData.settings.timeLimit > 0 ? \`<div id="timer" class="text-lg font-mono bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-md">\${Math.floor(state.timeRemaining / 60)}:\${(state.timeRemaining % 60).toString().padStart(2, '0')}</div>\` : '';

          return \`
            <header class="mb-6">
              <div class="flex justify-between items-center mb-2">
                <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">\${quizData.title}</h1>
                \${timeDisplay}
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div id="progress-bar" class="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style="width: \${((state.currentQuestionIndex + 1) / state.questions.length) * 100}%"></div>
              </div>
              <p class="text-right text-sm mt-1 text-slate-500 dark:text-slate-400">Question \${state.currentQuestionIndex + 1} of \${state.questions.length}</p>
            </header>
          \`;
      }
      
      function renderQuestion() {
        if (!playerView || state.currentQuestionIndex >= state.questions.length) return;

        const question = state.questions[state.currentQuestionIndex];
        const userAnswer = state.userAnswers.find(a => a.questionId === question.id) || { selectedAnswers: [] };

        const optionsHtml = question.options.map((option, index) => {
          const isSelected = userAnswer.selectedAnswers.includes(index);
          const inputType = question.type === 'MULTIPLE' ? 'checkbox' : 'radio';
          
          const ringClass = isSelected ? 'ring-2 ring-sky-500 bg-sky-100 dark:bg-sky-900/50' : '';
          const checkmarkSvg = \`<svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>\`;
          const radioCheckmark = isSelected ? checkmarkSvg : '';

          return \`
            <div data-option-index="\${index}" class="option-item flex items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 \${ringClass}">
              <div class="w-6 h-6 rounded-full border-2 \${isSelected ? 'bg-sky-500' : 'border-slate-300'} flex items-center justify-center mr-4 transition-colors">
                \${radioCheckmark}
              </div>
              <span class="text-lg text-slate-800 dark:text-slate-200">\${option}</span>
            </div>
          \`;
        }).join('');

        const playerHtml = \`
            \${renderHeader()}
            <div id="question-card" class="fade-in-up bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl">
                <h2 class="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100 leading-relaxed">\${question.text}</h2>
                <div class="space-y-4">\${optionsHtml}</div>
                <div class="mt-8 flex justify-between items-center">
                    <button id="prev-btn" \${state.currentQuestionIndex === 0 ? 'disabled' : ''} class="px-6 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Previous
                    </button>
                    <button id="next-btn" class="px-8 py-3 bg-sky-600 text-white rounded-lg font-semibold text-lg hover:bg-sky-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                        \${state.currentQuestionIndex === state.questions.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        \`;

        playerView.innerHTML = playerHtml;
        attachEventListeners();
      }

      function attachEventListeners() {
        document.querySelectorAll('.option-item').forEach(el => {
          el.addEventListener('click', () => handleOptionClick(parseInt(el.dataset.optionIndex)));
        });

        document.getElementById('next-btn')?.addEventListener('click', handleNextClick);
        document.getElementById('prev-btn')?.addEventListener('click', handlePrevClick);
      }

      function handleOptionClick(optionIndex) {
          const question = state.questions[state.currentQuestionIndex];
          let currentSelection = state.userAnswers.find(a => a.questionId === question.id)?.selectedAnswers || [];

          if (question.type === 'MULTIPLE') {
              if (currentSelection.includes(optionIndex)) {
                  currentSelection = currentSelection.filter(i => i !== optionIndex);
              } else {
                  currentSelection.push(optionIndex);
              }
          } else {
              currentSelection = [optionIndex];
          }

          const answerIndex = state.userAnswers.findIndex(a => a.questionId === question.id);
          if (answerIndex > -1) {
              state.userAnswers[answerIndex].selectedAnswers = currentSelection;
          } else {
              state.userAnswers.push({ questionId: question.id, selectedAnswers: currentSelection });
          }
          
          renderQuestion(); // Re-render to show selection
          if (question.type !== 'MULTIPLE') {
            setTimeout(handleNextClick, 300);
          }
      }

      function handleNextClick() {
        const card = document.getElementById('question-card');
        card?.classList.remove('fade-in-up');
        card?.classList.add('fade-out-down');

        setTimeout(() => {
          if (state.currentQuestionIndex < state.questions.length - 1) {
            state.currentQuestionIndex++;
            renderQuestion();
          } else {
            finishQuiz();
          }
        }, 300);
      }

      function handlePrevClick() {
        if (state.currentQuestionIndex > 0) {
          state.currentQuestionIndex--;
          renderQuestion();
        }
      }

      function finishQuiz() {
        clearInterval(state.timerInterval);
        playerView.classList.add('hidden');
        resultsView.classList.remove('hidden');
        renderResults();
      }

      function renderResults() {
        let correctCount = 0;
        state.questions.forEach(q => {
          const userAnswer = state.userAnswers.find(a => a.questionId === q.id);
          if (userAnswer) {
            const sortedCorrect = [...q.correctAnswers].sort();
            const sortedUser = [...userAnswer.selectedAnswers].sort();
            if (JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser)) {
              correctCount++;
            }
          }
        });

        const totalQuestions = state.questions.length;
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const points = correctCount * quizData.settings.pointsPerQuestion;
        
        const reviewHtml = state.questions.map(question => {
            const userAnswer = state.userAnswers.find(a => a.questionId === question.id) || { selectedAnswers: [] };
            const sortedCorrect = [...question.correctAnswers].sort();
            const sortedUser = [...userAnswer.selectedAnswers].sort();
            const isCorrect = JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser);

            const optionsReviewHtml = question.options.map((option, index) => {
                const isCorrectOption = question.correctAnswers.includes(index);
                const isSelected = userAnswer.selectedAnswers.includes(index);
                
                let optionClass = 'border-slate-200 dark:border-slate-700';
                if (isCorrectOption) optionClass = 'bg-green-100 dark:bg-green-900/50 border-green-500';
                else if (isSelected && !isCorrectOption) optionClass = 'bg-red-100 dark:bg-red-900/50 border-red-500';
                
                return \`<div class="flex items-start p-3 rounded-lg border-2 \${optionClass}">\${option}</div>\`;
            }).join('');
            
            return \`
              <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <div class="flex justify-between items-start">
                  <p class="text-lg font-semibold">\${question.text}</p>
                  <span class="text-sm font-bold \${isCorrect ? 'text-green-500' : 'text-red-500'} \${isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'} px-3 py-1 rounded-full">\${isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
                <div class="mt-4 space-y-3">\${optionsReviewHtml}</div>
                \${question.explanation ? \`<div class="mt-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg"><p class="text-sm"><span class="font-semibold">Explanation:</span> \${question.explanation}</p></div>\` : ''}
              </div>
            \`;
        }).join('');

        resultsView.innerHTML = \`
          <div class="fade-in-up">
            <header class="text-center mb-8">
              <h1 class="text-5xl font-extrabold">Quiz Results</h1>
            </header>
            <div class="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl mb-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                <div class="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <p class="text-sm uppercase font-semibold">Score</p>
                  <p class="text-5xl font-bold text-sky-500">\${score}<span class="text-3xl">%</span></p>
                  <p class="text-sm mt-1">\${points} points</p>
                </div>
                <div class="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
                  <p class="text-sm uppercase font-semibold">Correct Answers</p>
                  <p class="text-5xl font-bold text-green-500">\${correctCount} / \${totalQuestions}</p>
                </div>
              </div>
            </div>
            <div class="mt-10 flex justify-center gap-4">
              <button onclick="location.reload()" class="px-8 py-3 bg-sky-600 text-white rounded-lg font-semibold text-lg hover:bg-sky-700">Retry Quiz</button>
            </div>
            <div class="mt-12 max-w-4xl mx-auto">
              <h2 class="text-3xl font-bold text-center mb-6">Review Your Answers</h2>
              <div class="space-y-6">\${reviewHtml}</div>
            </div>
          </div>
        \`;
      }
      
      // Initial render
      renderQuestion();
      startTimer();
    });
  </script>
</body>
</html>
    `;
  }
}
