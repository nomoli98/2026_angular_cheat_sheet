```html form.component.html
<input
    class="form-control"
    formControlName="email"
    [class.is-invalid]="form.get('email')?.invalid && form.get('email')?.touched"
/>

@if (form.get('email')?.invalid && form.get('email')?.touched) {
<div class="invalid-feedback">Enter a valid email</div>
}
```
