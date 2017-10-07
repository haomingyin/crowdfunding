import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import User from '../models/user';

@Injectable()
export class UserService {
    private apiUrl = environment.apiUrl + 'users';
    user: User;

    constructor(private http: HttpClient) {
    }

    private getUser(userId: number, token: string): Promise<User> {
        return new Promise<User>(((resolve, reject) => {
            this.http.get(`${this.apiUrl}/${userId}`, {
                observe: 'response',
                headers: new HttpHeaders().append('X-Authorization', token),
                responseType: 'text'
            }).subscribe(res => {
                if (res.status === 200) {
                    const body = JSON.parse(res.body);
                    resolve(new User(body.id, body.username, body.location, body.email));
                } else {
                    reject(res.body);
                }
            });
        }));
    }

    login(credential: {username?: string, email?: string, password: string}): Promise<User> {
        let httpParams = new HttpParams;
        if (credential['username']) {
            httpParams = httpParams.append('username', credential.username);
        } else {
            httpParams = httpParams.append('email', credential.email);
        }
        httpParams = httpParams.append('password', credential.password);

        return new Promise<User>(((resolve, reject) => {
            this.http.post(`${this.apiUrl}/login`, null, {
                observe: 'response',
                params: httpParams,
                responseType: 'text'
            }).subscribe(res => {
                if (res.status === 200) {
                    const body = JSON.parse(res.body);
                    this.getUser(body.id, body.token)
                        .then(user => {
                            this.user = user;
                            this.user.id = Number(body.id);
                            this.user.token = body.token;
                            resolve(user);
                        })
                        .catch(err => reject(err));
                } else {
                    reject(res.body);
                }
            }, err => {
                reject(err.error);
            });
        }));
    }
}
