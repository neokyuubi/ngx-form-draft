import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FormDraftService } from 'ngx-form-draft';

@Component({
  selector: 'app-reactive-form',
  standalone: false,
  templateUrl: './reactive-form.component.html',
})
export class ReactiveFormComponent implements OnInit {
  myForm!: FormGroup;

  countries = [
    { value: '', label: '-- Select --' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
  ];

  constructor(
    private fb: FormBuilder,
    private draftService: FormDraftService,
  ) {}

  ngOnInit(): void {
    this.myForm = this.fb.group({
      fullName: [''],
      age: [null as number | null],
      email: [''],
      bio: [''],
      country: [''],
      tags: [[] as string[]],
      newsletter: [false],
      gender: [''],
      birthDate: [null as string | null],
      items: this.fb.array([this.createItemGroup()]),
    });
  }

  get items(): FormArray {
    return this.myForm.get('items') as FormArray;
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      name: [''],
      quantity: [null as number | null],
      notes: [''],
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onSubmit(): void {
    console.log('Reactive form submitted', this.myForm.value);
    this.draftService.clearAndReset('reactive_demo');
    alert('Form submitted! Draft cleared.');
  }
}
