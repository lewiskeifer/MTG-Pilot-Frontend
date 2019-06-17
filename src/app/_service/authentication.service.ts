import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../_model/user';
import { Login } from '../_model/login';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    private usersUrl = 'http://localhost:8080';  // URL to web api

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

    login(username: string, password: string) {
        console.log("chungle");
        var login2: Login = new Login(username, password);
        console.log(login2);
        this.http.post<any>(`${this.usersUrl}/login`, login2, this.httpOptions)
            .pipe(map(user => {

                console.log("wungle");
                // login successful if there's a jwt token in the response
                if (user && user.token) {

                    console.log(user);

                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }

                // return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    register(user: User) {
        return this.http.post(`${this.usersUrl}/register`, user);
    }
}