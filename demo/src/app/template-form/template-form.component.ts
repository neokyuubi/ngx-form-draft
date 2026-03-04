import { Component } from '@angular/core';

@Component({
  selector: 'app-template-form',
  standalone: false,
  templateUrl: './template-form.component.html',
})
export class TemplateFormComponent {
  countries = [
    { value: '', label: '-- Select --' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
  ];

  model = {
    fullName: '',
    age: null as number | null,
    email: '',
    bio: '',
    country: '',
    tags: [] as string[],
    newsletter: false,
    gender: '',
    birthDate: null as string | null,
  };

  onSubmit(): void {
    console.log('Template form submitted', this.model);
    alert('Form submitted! Check console.');
  }
}
