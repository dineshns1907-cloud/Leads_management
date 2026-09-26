import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

const TOKEN_KEY = 'leadiq_access_token';
const USER_KEY = 'leadiq_auth_user';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Retrieve token securely from localStorage
  const token = localStorage.getItem(TOKEN_KEY);

  let clonedReq = req;
  if (token && !req.headers.has('Authorization')) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear auth state to prevent stale credentials
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        const currentUrl = router.url;
        // Prevent infinite loops if 401 came from login attempt itself
        if (!req.url.includes('/auth/login') && !currentUrl.includes('/login')) {
          toastService.show(
            'Session Expired',
            'Your session has expired. Please sign in again to continue.',
            'warning'
          );
          router.navigate(['/login']);
        }
      } else if (error.status === 403) {
        toastService.show(
          'Access Denied',
          'You do not have permission to perform this action.',
          'warning'
        );
      }
      return throwError(() => error);
    })
  );
};
