//

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';



import { Subject, takeUntil } from 'rxjs';
import { AgentProfileService } from '../../../services/agent-profile/agent.profile.service';
import { ProfileStateService } from '../../../services/profile-state/profile-state.service';
import { AgentProfile } from '../../../interfaces/agentProfile.interface';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit, OnDestroy {
  editProfileForm!: FormGroup;
  previewImage: string | null = null;
  defaultImage: string = 'https://randomuser.me/api/portraits/men/3.jpg';
  isLoading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  private destroy$ = new Subject<void>();

  // Form validation error messages
  validationMessages = {
    name: {
      required: 'Name is required',
      minlength: 'Name must be at least 3 characters',
      maxlength: 'Name cannot exceed 20 characters',
      pattern: 'Name can only contain letters, spaces, and hyphens',
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
      invalidDomain:
        'Email must be from a valid domain (gmail.com, yahoo.com, etc.)',
    },
    phone: {
      required: 'Phone number is required',
      invalidEgyptianPhone: 'Please enter a valid Egyptian phone number',
    },
    newPassword: {
      minlength: 'Password must be at least 8 characters',
      pattern:
        'Password must include uppercase, lowercase, number and special character',
    },
  };

  constructor(
    private fb: FormBuilder,
    private agentProfileService: AgentProfileService,
    private profileStateService: ProfileStateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProfileData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.editProfileForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z\s\-]+$/),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, this.validateEmailDomain],
      ],
      phone: ['', [Validators.required, this.validateEgyptianPhone]],
      newPassword: [
        '',
        [
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
          ),
        ],
      ],
      status: ['away'],
    });

    // Monitor form control changes to show validation errors as user types
    this.setupControlValueChanges('name');
    this.setupControlValueChanges('email');
    this.setupControlValueChanges('phone');
  }

  // Setup value change subscription for each control to mark as touched on change
  private setupControlValueChanges(controlName: string): void {
    const control = this.editProfileForm.get(controlName);
    if (control) {
      control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (control.dirty) {
          control.markAsTouched();
        }
      });
    }
  }

  // Custom validator for Egyptian phone numbers
  validateEgyptianPhone(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null; // Let required validator handle empty values
    }

    // Remove spaces, dashes, or parentheses
    let cleanedValue = value.replace(/[\s\-()]/g, '');

    // Remove international prefix if present
    if (cleanedValue.startsWith('+20')) {
      cleanedValue = cleanedValue.replace('+20', '0');
    } else if (cleanedValue.startsWith('0020')) {
      cleanedValue = cleanedValue.replace('0020', '0');
    }

    // Validate only mobile numbers: 010, 011, 012, 015
    const mobilePattern = /^01[0125][0-9]{8}$/;

    if (mobilePattern.test(cleanedValue)) {
      return null; // Valid mobile number
    }

    return { invalidEgyptianPhone: true };
  }

  // Custom validator for email domains
  validateEmailDomain(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null; // Let required validator handle empty values
    }

    // If email format is invalid, let the email validator handle it
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
      return null;
    }

    // Check domain
    const validDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'icloud.com',
      'aol.com',
      'mail.ru',
      'protonmail.com',
      'zoho.com',
      'yandex.com',
      // Add more domains as needed
    ];

    const domain = value.split('@')[1]?.toLowerCase();

    if (
      !domain ||
      !validDomains.some((validDomain) => domain === validDomain)
    ) {
      return { invalidDomain: true };
    }

    return null;
  }

  // Get error message for a form control
  getErrorMessage(controlName: string): string {
    const control = this.editProfileForm.get(controlName);
    if (!control || !control.errors || (!control.touched && !control.dirty)) {
      return '';
    }

    const errors = control.errors;
    const errorMessages =
      this.validationMessages[
        controlName as keyof typeof this.validationMessages
      ];

    // Return the first error message found
    for (const errorKey in errors) {
      if (
        errorMessages &&
        errorMessages[errorKey as keyof typeof errorMessages]
      ) {
        return errorMessages[errorKey as keyof typeof errorMessages];
      }
    }

    return 'Invalid value';
  }

  // Check if a field is invalid and has been touched or is dirty
  isFieldInvalid(fieldName: string): boolean {
    const control = this.editProfileForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.editProfileForm.controls).forEach((key) => {
      const control = this.editProfileForm.get(key);
      control?.markAsTouched();
    });

    if (this.editProfileForm.invalid) {
      console.log('Form validation errors:', this.editProfileForm.errors);
      Object.keys(this.editProfileForm.controls).forEach((key) => {
        const control = this.editProfileForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });

      // Show generic error message
      this.error = 'Please correct the validation errors before submitting';
      return;
    }

    console.log('Form data:', this.editProfileForm.value); // Debug log

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const userAccessToken = localStorage.getItem('token') || '';

    const formData = this.editProfileForm.value;

    // Only include fields that have values
    const updateData: Partial<AgentProfile> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
    };

    // Add profile image if changed
    if (this.previewImage) {
      updateData.profileImage = this.previewImage;
    }

    this.agentProfileService
      .updateProfile(userAccessToken, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Update response:', response); // Debug log
          this.success = 'Profile updated successfully';
          this.isLoading = false;

          // Update the profile state after successful update
          this.profileStateService.updateProfileState(response);
        },
        error: (error) => {
          console.error('Update error:', error); // Debug log
          this.error = error.message || 'Failed to update profile';
          this.isLoading = false;
        },
      });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        this.error = 'File size should not exceed 5MB';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target?.result as string;
      };
      reader.onerror = () => {
        this.error = 'Error reading file';
      };
      reader.readAsDataURL(file);
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }

  private loadProfileData(): void {
    this.isLoading = true;
    const userAccessToken = localStorage.getItem('token') || '';

    console.log('Loading profile with token:', userAccessToken); // Debug log

    this.agentProfileService
      .getProfile(userAccessToken)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('Received profile data:', profile); // Debug log
          this.editProfileForm.patchValue({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            status: profile.status,
          });

          if (profile.profileImage) {
            this.previewImage = profile.profileImage;
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Profile load error:', error); // Debug log
          this.error = error.message || 'Failed to load profile data';
          this.isLoading = false;
        },
      });
  }

  retryLoading(): void {
    this.error = null;
    this.loadProfileData();
  }
}
