import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected network error occurred.';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = error.error.message;
    } else if (error.error && typeof error.error === 'object') {
      if (error.error.detail) {
        if (typeof error.error.detail === 'string') {
          errorMessage = error.error.detail;
        } else if (Array.isArray(error.error.detail)) {
          errorMessage = error.error.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        }
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to the LeadIQ backend server. Ensure FastAPI is running on port 8000.';
    } else if (error.status === 401) {
      errorMessage = 'Your session has expired or authentication failed. Please sign in again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 422) {
      errorMessage = 'Validation error in request payload.';
    } else if (error.status >= 500) {
      errorMessage = 'An internal server error occurred on the LeadIQ API.';
    }
    return throwError(() => new Error(errorMessage));
  }

  private buildParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    Object.keys(params).forEach(key => {
      const val = params[key];
      if (val !== undefined && val !== null && val !== '') {
        httpParams = httpParams.set(key, String(val));
      }
    });
    return httpParams;
  }

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.get<T>(url, { params: this.buildParams(params) }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  getWithHeaders<T>(endpoint: string, params?: Record<string, any>): Observable<{ body: T | null; headers: HttpHeaders }> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.get<T>(url, {
      params: this.buildParams(params),
      observe: 'response'
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.post<T>(url, body).pipe(
      catchError(err => this.handleError(err))
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.put<T>(url, body).pipe(
      catchError(err => this.handleError(err))
    );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.patch<T>(url, body).pipe(
      catchError(err => this.handleError(err))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    return this.http.delete<T>(url).pipe(
      catchError(err => this.handleError(err))
    );
  }
}
