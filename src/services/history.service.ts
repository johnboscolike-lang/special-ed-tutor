
import { Injectable, signal } from '@angular/core';
import { ComprehensiveAnalysisResponse } from './gemini.service';

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageData: string; // Base64 string
  analysis: ComprehensiveAnalysisResponse;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  history = signal<HistoryItem[]>([]);
  private readonly STORAGE_KEY = 'exam_tutor_history';
  private readonly MAX_ITEMS = 5; // Limit to 5 items to prevent localStorage quota issues

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.history.set(parsed);
        }
      } catch (e) {
        console.error('Failed to parse history', e);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  addToHistory(imageData: string, analysis: ComprehensiveAnalysisResponse) {
    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      imageData,
      analysis
    };

    this.history.update(prev => {
      // Add new item to the beginning
      const updated = [newItem, ...prev];
      // Keep only the MAX_ITEMS
      const limited = updated.slice(0, this.MAX_ITEMS);
      
      this.saveToStorage(limited);
      return limited;
    });
  }

  deleteItem(id: string) {
    this.history.update(prev => {
      const updated = prev.filter(item => item.id !== id);
      this.saveToStorage(updated);
      return updated;
    });
  }

  private saveToStorage(items: HistoryItem[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage quota exceeded. Trying to save fewer items.');
      // If storage is full, try removing the oldest item (last one) and save again
      if (items.length > 1) {
        this.saveToStorage(items.slice(0, -1));
      } else {
        console.error('Cannot save history item, storage full.');
      }
    }
  }
}
