import {
  Directive, Input, OnInit, AfterViewInit, OnDestroy, Optional, ComponentRef,
  ViewContainerRef, ChangeDetectorRef, ElementRef, Renderer2,
} from '@angular/core';
import { NgForm, FormGroupDirective, AbstractControl, FormArray, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, skip, filter } from 'rxjs/operators';
import { FormDraftService } from './form-draft.service';
import { FormDraftBannerComponent } from './form-draft-banner.component';

/**
 * Auto-saves and restores form drafts
 * 
 * @example
 * <form [formGroup]="myForm" ngxFormDraft="myFormId">
 * 
 * @example
 * <form [formGroup]="myForm" [ngxFormDraft]="'edit_' + entityId" [draftExcludeFields]="['password']">
 */
@Directive({
  selector: '[ngxFormDraft]',
})
export class FormDraftDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input('ngxFormDraft') formId!: string;
  @Input() draftDebounce = 800;
  @Input() draftExcludeFields: string[] = [];
  @Input() draftShowOnChange = false;
  @Input() draftRestoredText = 'Draft restored';
  @Input() draftSavedText = 'Draft saved';
  @Input() draftSavedLabel = 'saved';
  @Input() draftDiscardText = 'Discard';

  private destroy$ = new Subject<void>();
  private bannerRef: ComponentRef<FormDraftBannerComponent> | null = null;
  private formControl: AbstractControl | null = null;
  private initialValues: Record<string, any> = {};
  private isRestoring = false;

  constructor(
    @Optional() private formGroupDir: FormGroupDirective,
    @Optional() private ngForm: NgForm,
    private draftService: FormDraftService,
    private viewContainerRef: ViewContainerRef,
    private cdRef: ChangeDetectorRef,
    private elRef: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.formControl = this.formGroupDir?.form || this.ngForm?.form || null;
    if (!this.formControl || !this.formId) return;

    // For reactive forms, capture initial values and restore draft immediately
    if (this.formGroupDir) {
      this.initialValues = JSON.parse(JSON.stringify(this.formControl.value));
      console.log('[ngx-form-draft] Initial values (reactive):', this.initialValues);
      
      const draft = this.draftService.load(this.formId);
      if (draft) {
        this.restoreDraft(draft.values);
        this.showBanner(draft.savedAt, true);
      }
    }
    // For template forms, restoration happens in AfterViewInit

    // For template-driven forms, wait until form is actually used
    let hasUserInteraction = false;
    
    this.formControl.valueChanges
      .pipe(
        filter(() => {
          if (this.isRestoring) return false;
          // For template forms, only save after first real user interaction
          if (this.ngForm && !hasUserInteraction) {
            const currentValues = this.formControl?.value || {};
            const isDifferent = JSON.stringify(currentValues) !== JSON.stringify(this.initialValues);
            console.log('[ngx-form-draft] Template form check - Current:', currentValues, 'Initial:', this.initialValues, 'Different:', isDifferent);
            if (isDifferent) {
              hasUserInteraction = true;
              return true;
            }
            return false;
          }
          return true;
        }),
        debounceTime(this.draftDebounce),
        takeUntil(this.destroy$)
      )
      .subscribe((values) => {
        console.log('[ngx-form-draft] Saving draft:', values);
        this.saveDraft(values);
      });
  }

  ngAfterViewInit(): void {
    // For template-driven forms, restore draft and capture initial values after view is initialized
    if (this.ngForm && this.formControl) {
      const draft = this.draftService.load(this.formId);
      
      if (draft) {
        // Set isRestoring BEFORE setTimeout to block any emissions
        this.isRestoring = true;
      }
      
      setTimeout(() => {
        if (draft) {
          // Restore draft
          console.log('[ngx-form-draft] Restoring template draft:', draft.values);
          this.restoreDraft(draft.values);
          this.showBanner(draft.savedAt, true);
          // Set initial to empty so any change will save
          this.initialValues = {};
          console.log('[ngx-form-draft] Initial values (template, with draft): {}');
        } else {
          // No draft, capture defaults as initial
          this.initialValues = JSON.parse(JSON.stringify(this.formControl!.value));
          console.log('[ngx-form-draft] Initial values (template, no draft):', this.initialValues);
        }
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyBanner();
  }

  private saveDraft(values: Record<string, any>): void {
    const filtered = this.filterFields(values);
    
    // Don't save if empty
    if (this.isAllEmpty(filtered)) {
      return;
    }

    // Don't save if matches initial values (even if initial is empty)
    if (this.matchesInitialValues(filtered)) {
      return;
    }

    this.draftService.save(this.formId, filtered);
    if (this.draftShowOnChange && !this.bannerRef) {
      this.showBanner(Date.now(), false);
    }
  }

  private filterFields(values: Record<string, any>): Record<string, any> {
    if (!this.draftExcludeFields.length) return values;
    const result = { ...values };
    this.draftExcludeFields.forEach(field => delete result[field]);
    return result;
  }

  private isAllEmpty(values: Record<string, any>): boolean {
    return Object.values(values).every(
      v => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
    );
  }

  private matchesInitialValues(values: Record<string, any>): boolean {
    return JSON.stringify(values) === JSON.stringify(this.initialValues);
  }

  private restoreDraft(values: Record<string, any>): void {
    if (!this.formControl) return;
    this.isRestoring = true;

    const form = this.formGroupDir?.form || this.ngForm?.form;
    if (form) {
      this.prepareFormArrays(form, values);
      form.patchValue(values);
    }

    setTimeout(() => this.isRestoring = false, 100);
  }

  private prepareFormArrays(control: AbstractControl, value: any): void {
    if (!control || value == null) return;

    if (control instanceof FormGroup && value && typeof value === 'object' && !Array.isArray(value)) {
      Object.keys(value).forEach(key => {
        const childControl = control.get(key);
        if (childControl) this.prepareFormArrays(childControl, value[key]);
      });
      return;
    }

    if (control instanceof FormArray && Array.isArray(value)) {
      const formArray = control as FormArray;

      while (formArray.length < value.length) {
        const template = formArray.at(0);
        if (template instanceof FormGroup) {
          const newGroup = new FormGroup({});
          Object.keys(template.controls).forEach(ctrlName => {
            const existing = template.get(ctrlName) as AbstractControl;
            if (existing instanceof FormArray) {
              newGroup.addControl(ctrlName, new FormArray([]));
            } else if (existing instanceof FormGroup) {
              newGroup.addControl(ctrlName, new FormGroup({}));
            } else {
              newGroup.addControl(ctrlName, new FormControl(null));
            }
          });
          formArray.push(newGroup);
        } else if (template) {
          formArray.push(new FormControl(null));
        } else {
          const firstValue = value[0];
          if (firstValue && typeof firstValue === 'object' && !Array.isArray(firstValue)) {
            const group = new FormGroup({});
            Object.keys(firstValue).forEach(key => group.addControl(key, new FormControl(null)));
            formArray.push(group);
          } else {
            formArray.push(new FormControl(null));
          }
        }
      }

      while (formArray.length > value.length) {
        formArray.removeAt(formArray.length - 1);
      }

      value.forEach((childValue, index) => {
        this.prepareFormArrays(formArray.at(index), childValue);
      });
    }
  }

  private discardDraft(): void {
    this.draftService.clear(this.formId);

    if (this.formControl) {
      this.isRestoring = true;
      const form = this.formGroupDir?.form || this.ngForm?.form;
      if (form) {
        this.prepareFormArrays(form, this.initialValues);
        form.reset(this.initialValues);
      }
      setTimeout(() => {
        this.isRestoring = false;
      }, this.draftDebounce + 200);
    }

    this.destroyBanner();
  }

  private showBanner(savedAt: number, isRestored = false): void {
    this.bannerRef = this.viewContainerRef.createComponent(FormDraftBannerComponent);
    this.bannerRef.setInput('visible', true);
    this.bannerRef.setInput('isRestored', isRestored);
    this.bannerRef.setInput('timeLabel', isRestored ? this.draftService.formatTimestamp(savedAt) : '');
    this.bannerRef.setInput('restoredText', this.draftRestoredText);
    this.bannerRef.setInput('savedText', this.draftSavedText);
    this.bannerRef.setInput('savedLabel', this.draftSavedLabel);
    this.bannerRef.setInput('discardText', this.draftDiscardText);

    this.bannerRef.instance.discard.subscribe(() => this.discardDraft());

    const bannerEl = this.bannerRef.location.nativeElement;
    const formEl = this.elRef.nativeElement;
    this.renderer.insertBefore(formEl, bannerEl, formEl.firstChild);

    this.cdRef.detectChanges();
  }

  private destroyBanner(): void {
    if (this.bannerRef) {
      this.bannerRef.destroy();
      this.bannerRef = null;
    }
  }

  public clearDraft(): void {
    this.draftService.clear(this.formId);
    this.destroyBanner();
  }
}
