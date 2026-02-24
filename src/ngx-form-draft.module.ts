import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormDraftDirective } from './form-draft.directive';
import { FormDraftBannerComponent } from './form-draft-banner.component';

@NgModule({
  declarations: [FormDraftDirective, FormDraftBannerComponent],
  imports: [CommonModule],
  exports: [FormDraftDirective, FormDraftBannerComponent],
})
export class NgxFormDraftModule {}
