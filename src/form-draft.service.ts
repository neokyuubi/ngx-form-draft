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

  /** Registry of formId -> reset callback (used by directive to reset form + banner) */
  private resetRegistry = new Map<string, () => void>();

  /**
   * Register a callback to reset the form and draft UI for the given formId.
   * Called by the directive; apps should use clearAndReset(formId) instead.
   */
  registerReset(formId: string, resetFn: () => void): void {
    this.resetRegistry.set(formId, resetFn);
  }

  /**
   * Unregister the reset callback for the given formId.
   * Called by the directive on destroy.
   */
  unregisterReset(formId: string): void {
    this.resetRegistry.delete(formId);
  }

  /**
   * Clear the draft from storage and, if a directive is registered for this formId,
   * reset the form and dismiss the draft banner in one call.
   * Use this on form submit to clear local storage and reset the form in one line.
   */
  clearAndReset(formId: string): void {
    this.clear(formId);
    this.resetRegistry.get(formId)?.();
  }

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
