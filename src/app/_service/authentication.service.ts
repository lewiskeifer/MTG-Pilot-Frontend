import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Login } from '../_model/login';
import { User } from '../_model/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private usersUrl = 'https://mtgpilot.com:8080';
    // private usersUrl = 'http://localhost:8080';

    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(login: Login): Observable<User> {

        const url = `${this.usersUrl}/login`;
        return this.http.post<User>(url, login, this.httpOptions)
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }

                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    register(user: User) {
        return this.http.post<User>(`${this.usersUrl}/register`, user);
    }
}