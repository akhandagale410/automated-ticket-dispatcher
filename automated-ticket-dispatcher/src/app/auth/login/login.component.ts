import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  onSubmit() {
    this.auth.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => this.error = err.error.message || 'Login failed'
    });
  }
}