```ts signal-validators.component.ts
import { signal } from '@angular/core';
import { form, FormField, required, minLength, maxLength, min, max } from '@angular/forms/signals';

@Component({
  imports: [FormField], // required import
  ...
})
export class SignalValidatorsComponent {
  // the model
  builtInModel = signal({ name: '', height: 50, agreeToTerms: false });

  // the schema
  builtInForm = form(this.builtInModel, (field) => {
    required(field.name, { message: 'Name is required' });
    minLength(field.name, 2, { message: 'At least 2 characters' });
    maxLength(field.name, 50, { message: 'At most 50 characters' });

    min(field.height, 50, { message: 'Minimum 50 cm' });
    max(field.height, 275, { message: 'Maximum 275 cm' });

    required(field.agreeToTerms, { message: 'You must accept the terms' }); // false = empty
  });
}
```

```html signal-validators.component.html
@let name = builtInForm.name();
<input class="form-control" [formField]="builtInForm.name"
       [class.is-invalid]="name.touched() && name.invalid()" />

<!-- same block everywhere -->
@if (name.touched()) {
  @for (error of name.errors(); track error.kind) {
    <div class="invalid-feedback">{{ error.message }}</div>
  }
}

<input type="number" class="form-control" [formField]="builtInForm.height" />
<input type="checkbox" class="form-check-input" [formField]="builtInForm.agreeToTerms" />
```
