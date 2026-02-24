import { Injectable } from '@angular/core';

export interface FormDraftData {
  values: Record<string, any>;
  savedAt: number;
  formId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormDraftService {
  private readonly STORAGE_PREFIX = 'form_draft_';
  private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

  private buildKey(formId: string): string {
    return `${this.STORAGE_PREFIX}${formId}`;
  }

  save(formId: string, values: Record<string, any>): void {
    try {
      const draft: FormDraftData = { values, savedAt: Date.now(), formId };
      localStorage.setItem(this.buildKey(formId), JSON.stringify(draft));
    } catch (e) {
      console.warn('[FormDraft] Could not save draft:', e);
    }
  }

  load(formId: string): FormDraftData | null {
    try {
      const raw = localStorage.getItem(this.buildKey(formId));
      if (!raw) return null;

      const draft: FormDraftData = JSON.parse(raw);
      if (Date.now() - draft.savedAt > this.MAX_AGE_MS) {
        this.clear(formId);
        return null;
      }
      return draft;
    } catch (e) {
      console.warn('[FormDraft] Could not load draft:', e);
      return null;
    }
  }

  clear(formId: string): void {
    try {
      localStorage.removeItem(this.buildKey(formId));
    } catch (e) {
      console.warn('[FormDraft] Could not clear draft:', e);
    }
  }

  formatTimestamp(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
