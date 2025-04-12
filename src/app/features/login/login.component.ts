import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
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
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  showPassword = false;
  error = '';
  loading = false;
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        this.validateEmailDomain
      ]],
      password: ['', [Validators.required]], // Simplified password validation
    });
  }

  ngOnInit(): void {
    // Lifecycle hook implementation
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log(response);
        
        this.authService.saveUser(response.token);
        this.router.navigate(['/chat']);
        this.loading = false;
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Invalid email or password. Please try again!';
        }
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // Add email domain validator
  private validateEmailDomain(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      return null;
    }
    const validDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'icloud.com', 'aol.com', 'protonmail.com'
    ];
    const domain = value.split('@')[1]?.toLowerCase();
    if (!domain || !validDomains.some(validDomain => domain === validDomain)) {
      return { invalidDomain: true };
    }
    return null;
  }

  // Add helper methods for validation messages
  getEmailErrorMessage(): string {
    const control = this.loginForm.get('email');
    if (control?.errors) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email']) return 'Please enter a valid email address';
      if (control.errors['invalidDomain']) 
        return 'Email must be from a valid domain (gmail.com, yahoo.com, etc.)';
    }
    return '';
  }
}