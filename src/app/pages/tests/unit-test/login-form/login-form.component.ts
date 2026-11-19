import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  // protected readonly auth = inject(AuthService);

  error = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  onSubmit() {
    const { email, password } = this.loginForm.getRawValue();
    // const ok = this.auth.login(email, password);
    // this.error.set(!ok);
  }

  logout() {
    // this.auth.logout();
    this.loginForm.reset();
  }
}
