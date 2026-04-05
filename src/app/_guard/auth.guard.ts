import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../_service/authentication.service';

export const authGuard: CanActivateFn = (_route, _state) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    if (authService.currentUserValue) {
        return true;
    }

    router.navigate(['/home']);
    return false;
};
