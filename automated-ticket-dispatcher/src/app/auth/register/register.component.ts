import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.message = 'Registering...';
      this.auth.register(this.registerForm.value).subscribe({
        next: res => {
          this.message = res.message || 'Registration successful!';
          // Redirect to login after successful registration
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: err => {
          console.error('Registration error:', err);
          this.message = err.error?.message || 'Registration failed';
        }
      });
    } else {
      this.message = 'Please fill all fields correctly';
    }
  }
}