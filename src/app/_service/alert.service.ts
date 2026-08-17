import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {

    private subject = new ReplaySubject<any>(1);
    private keepAfterNavigationChange = false;
    private dismissTimer: any;

    constructor(private router: Router) {
        // clear alert message on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterNavigationChange) {
                    // only keep for a single location change
                    this.keepAfterNavigationChange = false;
                } else {
                    // clear alert
                    this.subject.next(undefined);
                }
            }
        });
    }

    success(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        this.subject.next({ type: 'success', text: message });

        // auto-dismiss the success banner after 3 seconds
        clearTimeout(this.dismissTimer);
        this.dismissTimer = setTimeout(() => this.subject.next(undefined), 3000);
    }

    error(message: string, keepAfterNavigationChange = false) {
        this.keepAfterNavigationChange = keepAfterNavigationChange;
        clearTimeout(this.dismissTimer);
        this.subject.next({ type: 'error', text: message });
    }

    /** Dismiss the current alert, if any. */
    clear() {
        clearTimeout(this.dismissTimer);
        this.subject.next(undefined);
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}