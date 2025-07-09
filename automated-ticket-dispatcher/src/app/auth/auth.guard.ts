import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  authService.setRedirectUrl(state.url);
  
  // Redirect to login page
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isRole('admin')) {
    return true;
  }

  // If user is not admin, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};

export const agentGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && 
      (authService.isRole('agent') || authService.isRole('admin'))) {
    return true;
  }

  // If user is not agent or admin, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // If user is already logged in, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
