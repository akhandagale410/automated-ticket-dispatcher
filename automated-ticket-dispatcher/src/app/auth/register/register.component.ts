import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      password: [''],
      role: ['']
    });
  }

  onSubmit() {
    this.auth.register(this.registerForm.value).subscribe({
      next: res => this.message = res.message || 'Registration successful!',
      error: err => this.message = err.error.message || 'Registration failed'
    });
  }
}