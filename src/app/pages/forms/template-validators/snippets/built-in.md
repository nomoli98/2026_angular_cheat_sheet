```ts template-validators.component.ts
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule], // required import
  ...
})
export class TemplateValidatorsComponent {
  // plain object
  builtIn = { name: '', height: 50, agreeToTerms: false };
}
```

```html template-validators.component.html
<form #builtInForm="ngForm">
    <!-- name="" is mandatory -->
    <input
        name="name"
        class="form-control"
        [(ngModel)]="builtIn.name"
        #nameCtrl="ngModel"
        required
        minlength="2"
        maxlength="50"
        [class.is-invalid]="nameCtrl.invalid && nameCtrl.touched"
    />

    @if (nameCtrl.touched) { @if (nameCtrl.errors?.['required']) {
    <div class="invalid-feedback">Name is required</div>
    } @if (nameCtrl.errors?.['minlength']) {
    <div class="invalid-feedback">
        At least {{ nameCtrl.errors?.['minlength'].requiredLength }} characters
    </div>
    } }

    <!-- type="number" only -->
    <input
        name="height"
        type="number"
        class="form-control"
        [(ngModel)]="builtIn.height"
        #heightCtrl="ngModel"
        required
        min="50"
        max="275"
    />

    <!-- checkbox: must be checked -->
    <input
        name="agreeToTerms"
        type="checkbox"
        class="form-check-input"
        [(ngModel)]="builtIn.agreeToTerms"
        #termsCtrl="ngModel"
        required
    />
</form>
```
