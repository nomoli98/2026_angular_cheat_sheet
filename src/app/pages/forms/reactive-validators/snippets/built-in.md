```ts reactive-validators.component.ts
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule], // required import
  ...
})
export class ReactiveValidatorsComponent {
  builtInForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true, // no null on reset
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
    }),
    height: new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(50), Validators.max(275)],
    }),
    agreeToTerms: new FormControl(false, {
      nonNullable: true,
      validators: Validators.requiredTrue, // checkbox must be checked
    }),
  });
}
```

```html reactive-validators.component.html
<form [formGroup]="builtInForm">
    @let name = builtInForm.controls.name;
    <input
        class="form-control"
        formControlName="name"
        [class.is-invalid]="name.invalid && name.touched"
    />

    @if (name.touched) { @if (name.hasError('required')) {
    <div class="invalid-feedback">Name is required</div>
    }
    <!-- lowercase key! -->
    @if (name.hasError('minlength')) {
    <div class="invalid-feedback">
        At least {{ name.getError('minlength').requiredLength }} characters
    </div>
    } } @let height = builtInForm.controls.height;
    <input type="number" class="form-control" formControlName="height" />
    @if (height.touched && height.hasError('min')) {
    <div class="invalid-feedback">Minimum {{ height.getError('min').min }} cm</div>
    }
</form>
```
