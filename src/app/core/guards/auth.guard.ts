import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Not logged in -> redirect to login
  router.navigate(['/login']);
  return false;
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      if (allowedRoles.map(r => r.toLowerCase()).includes('admin')) {
        router.navigate(['/admin/login']);
      } else {
        router.navigate(['/login']);
      }
      return false;
    }

    const currentUser = authService.currentUser();
    if (currentUser && allowedRoles.map(r => r.toLowerCase()).includes(currentUser.role.toLowerCase())) {
      return true;
    }

    alert('403 Unauthorized: Access Denied. You do not have permission to view Admin pages.');
    router.navigate(['/dashboard']);
    return false;
  };
};

