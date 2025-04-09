import { Component } from '@angular/core';
import { ResetPasswordService } from '../../../services/resetPassword/reset-password.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-security',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css',
})
export class SecurityComponent {
  resetForm: FormGroup;
  isSubmitted = false;
  errorMessage: string = '';
  successMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }
    this.isSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { email, otp, newPassword } = this.resetForm.value;
    this.resetPasswordService.resetPassword(email, otp, newPassword).subscribe({
      next: (response) => {
        this.isSubmitted = false;
        this.successMessage = 'Password reset successfully!';
        console.log(response);
      },
      error: (error) => {
        this.isSubmitted = false;
        this.errorMessage =
          error.error?.message || 'Failed to reset password. Please try again.';
      },
    });
  }
}
