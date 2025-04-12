import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

/* material / common imports */
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        repeat_password: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn) {
      this.router.navigateByUrl('/chat');
    }
  }

  /** custom validator */
  private passwordMatchValidator = (form: FormGroup) =>
    form.get('password')?.value === form.get('repeat_password')?.value
      ? null
      : { mismatch: true };

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const { name, email, password, repeat_password } = this.registerForm.value;
    this.loading = true;
    this.error = '';

    this.auth.register(name, email, password, repeat_password).subscribe({
      next: () => {
        // token already saved by AuthService
        this.loading = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ?? 'Something went wrong. Please try again!';
      },
    });
  }
}
