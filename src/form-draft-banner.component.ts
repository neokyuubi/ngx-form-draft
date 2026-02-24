import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'ngx-form-draft-banner',
  template: `
    <div class="form-draft-banner" *ngIf="visible" [@slideDown]>
      <div class="form-draft-banner__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12L14.5 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="form-draft-banner__content">
        <span class="form-draft-banner__text">
          <span *ngIf="isRestored">{{ restoredText }}</span>
          <span *ngIf="!isRestored">{{ savedText }}</span>
          <span class="form-draft-banner__time" *ngIf="timeLabel && isRestored">
            &middot; {{ savedLabel }} {{ timeLabel }}
          </span>
        </span>
      </div>
      <div class="form-draft-banner__actions">
        <button class="form-draft-banner__btn form-draft-banner__btn--discard" (click)="discard.emit()" type="button">
          ✕ {{ discardText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .form-draft-banner {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px; margin-bottom: 12px;
      border-radius: 8px; background: linear-gradient(135deg, #eef6ff 0%, #f0f4ff 100%);
      border: 1px solid #c5ddf8; box-shadow: 0 2px 8px rgba(18, 138, 214, 0.08);
    }
    .form-draft-banner__icon {
      display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
      border-radius: 6px; background: linear-gradient(135deg, #128ad6, #22b9ff); color: #fff; flex-shrink: 0;
    }
    .form-draft-banner__content { flex: 1; min-width: 0; }
    .form-draft-banner__text { font-size: 13px; font-weight: 600; color: #1a3a5c; }
    .form-draft-banner__time { font-weight: 400; color: #6b8aaa; font-size: 12px; }
    .form-draft-banner__actions { flex-shrink: 0; }
    .form-draft-banner__btn {
      border: none; padding: 5px 12px; border-radius: 6px; font-size: 12px;
      font-weight: 600; cursor: pointer; transition: all 0.2s ease;
    }
    .form-draft-banner__btn--discard { background: transparent; color: #8899a6; border: 1px solid #d0dce6; }
    .form-draft-banner__btn--discard:hover { background: #fef2f2; color: #e62e43; border-color: #e62e43; }
  `],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDraftBannerComponent {
  @Input() visible = false;
  @Input() timeLabel = '';
  @Input() isRestored = false;
  @Input() restoredText = 'Draft restored';
  @Input() savedText = 'Draft saved';
  @Input() savedLabel = 'saved';
  @Input() discardText = 'Discard';
  @Output() discard = new EventEmitter<void>();
}
