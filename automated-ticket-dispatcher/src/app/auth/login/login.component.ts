import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  isLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
  if (this.loginForm.valid) {
    this.isLoading = true;
    this.error = '';
    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        // Get the current user from AuthService
        const user = this.auth.getCurrentUser();
        // Redirect based on role
        if (user?.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (user?.role === 'agent') {
          this.router.navigate(['/agent-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: err => {
        this.isLoading = false;
        this.error = err.error?.message || 'Login failed';
      }
    });
  } else {
    this.error = 'Please fill all fields correctly';
  }
}
}