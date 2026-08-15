import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_service/authentication.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public auth: AuthenticationService) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const re = '/login';
    const re2 = '/register';

    // Exclude interceptor for login request:
    if (request.url.search(re) !== -1 || request.url.search(re2) !== -1) {
        return next.handle(request);
    }

    // No user logged in, so send the request unauthenticated and let the
    // server reject it rather than throwing here:
    const token = this.auth.currentUserValue?.token;
    if (!token) {
      return next.handle(request);
    }

    request = request.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    });
    return next.handle(request);
  }
}