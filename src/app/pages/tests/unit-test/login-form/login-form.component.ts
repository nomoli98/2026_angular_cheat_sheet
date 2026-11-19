import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthController } from '@core/controllers/auth.controller';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  // The component talks to the CONTROLLER: no Observable, no subscribe here.
  protected readonly auth = inject(AuthController);

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  onSubmit() {
    // getRawValue() = { email, password } = a LoginRequest
    this.auth.login(this.loginForm.getRawValue());
  }

  logout() {
    this.auth.logout();
    this.loginForm.reset();
  }
}
