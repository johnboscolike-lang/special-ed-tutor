
import { Component, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GeminiService, ComprehensiveAnalysisResponse } from './services/gemini.service';
import { HistoryService, HistoryItem } from './services/history.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  public historyService = inject(HistoryService);

  selectedImage = signal<string | null>(null);
  analysisResult = signal<ComprehensiveAnalysisResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  mobileView = signal<'input' | 'output'>('input');
  
  // State for UI management in results view
  activeTab = signal<'single' | 'historical'>('single');
  showPracticeProblems = signal<boolean>(false);
  factCheckState = signal<{ selected: boolean | null; revealed: boolean }[]>([]);


  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
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

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.error.set('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.error.set('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    this.error.set(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImage.set(e.target?.result as string);
      this.resetResults();
    };
    reader.readAsDataURL(file);
  }

  clearImage(event: Event) {
    event.stopPropagation();
    this.selectedImage.set(null);
    this.resetResults();
    this.error.set(null);
    this.mobileView.set('input');
  }

  async analyze() {
    const imageData = this.selectedImage();
    if (!imageData) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.resetResults();

    try {
      const base64Data = imageData.split(',')[1];
      const result = await this.geminiService.analyzeImage(base64Data);
      
      this.analysisResult.set(result);
      this.historyService.addToHistory(imageData, result);
      
      this.mobileView.set('output');
      this.activeTab.set('single');
      this.showPracticeProblems.set(false);
    } catch (err) {
      console.error(err);
      this.error.set('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      this.isLoading.set(false);
    }
  }

  loadHistoryItem(item: HistoryItem) {
    this.selectedImage.set(item.imageData);
    this.analysisResult.set(item.analysis);
    this.mobileView.set('output');
    this.activeTab.set('single');
    this.showPracticeProblems.set(false);
    this.factCheckState.set([]);
  }

  deleteHistoryItem(id: string, event: Event) {
    event.stopPropagation();
    this.historyService.deleteItem(id);
  }

  revealPracticeProblems() {
    this.showPracticeProblems.set(true);
    const practiceProblems = this.analysisResult()?.practiceProblems;
    if (practiceProblems) {
      this.factCheckState.set(
        practiceProblems.factCheck.map(() => ({ selected: null, revealed: false }))
      );
    }
  }

  checkFact(index: number, selectedAnswer: boolean) {
    this.factCheckState.update(state => {
      if (state[index]) {
        state[index].selected = selectedAnswer;
        state[index].revealed = true;
      }
      return [...state];
    });
  }

  reset() {
    this.selectedImage.set(null);
    this.resetResults();
    this.error.set(null);
    this.mobileView.set('input');
  }
  
  private resetResults() {
    this.analysisResult.set(null);
    this.showPracticeProblems.set(false);
    this.factCheckState.set([]);
  }
}
