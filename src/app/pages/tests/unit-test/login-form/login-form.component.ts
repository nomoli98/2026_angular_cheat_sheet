import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  protected readonly auth = inject(AuthService);

  error = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  onSubmit() {
    this.error.set(false);
    // getRawValue() = { email, password } = a LoginRequest
    this.auth.login(this.loginForm.getRawValue()).subscribe({
      // next: nothing to do, the service already filled auth.currentUser()
      error: () => this.error.set(true), // wrong email/password (or API down)
    });
  }

  logout() {
    this.auth.logout();
    this.loginForm.reset();
  }
}
