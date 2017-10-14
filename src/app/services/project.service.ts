import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Project, ProjectBrief, ProjectNew } from '../models/project';
import { User } from '../models/user';

@Injectable()
export class ProjectService {
    private apiUrl = environment.apiUrl + 'projects';

    constructor(private http: HttpClient) {
    }

    private getParams(so: SearchOptions): HttpParams {
        let httpParams = new HttpParams()
            .append('startIndex', '' + so.startIndex)
            .append('count', '' + so.count);

        if (so.options) {
            if (so.options.open) {
                httpParams = httpParams.append('open', String(so.options.open));
            }
            if (so.options.creator) {
                httpParams = httpParams.append('creator', '' + so.options.creator);
            }
            if (so.options.backer) {
                httpParams = httpParams.append('backer', '' + so.options.backer);
            }
        }
        return httpParams;
    }

    pledge(user: User, amount: number, anonymous: boolean, pId: number): Promise<any> {
        const body = {
            id: user.id,
            amount: amount,
            anonymous: anonymous,
            card: {
                authToken: 'blah'
            }
        };
        return new Promise((resolve, reject) => {
            this.http.post(`${this.apiUrl}/${pId}/pledge`, body, {
                observe: 'response',
                headers: new HttpHeaders().append('x-authorization', user.token),
                responseType: 'text'
            }).subscribe(res => {
                resolve(res.body);
            }, err => reject(err));
        });
    }


    getProjectBriefs(searchOption: SearchOptions): Promise<ProjectBrief[]> {
        return new Promise<ProjectBrief[]>(((resolve, reject) => {
            this.http.get(this.apiUrl, {
                observe: 'response',
                params: this.getParams(searchOption),
                responseType: 'json'
            }).subscribe(res => {
                if (res.status === 200) {
                    resolve(res.body as ProjectBrief[]);
                } else {
                    reject(res.body);
                }
            }, err => reject(err.error));
        }));
    }

    getProject(projectId: number): Promise<Project> {
        return new Promise<Project>(((resolve, reject) => {
            this.http.get(`${this.apiUrl}/${projectId}`, {
                observe: 'response',
                responseType: 'text'
            }).subscribe(res => {
                if (res.status === 200) {
                    resolve(JSON.parse(res.body) as Project);
                } else {
                    reject(res.body);
                }
            }, err => reject(err.error));
        }));
    }

    uploadImage(data: Buffer, id: number, token: string): Promise<any> {
        let header = new HttpHeaders().append('x-authorization', token);
        header = header.append('Content-Type', 'image/png');
        return new Promise<any>(((resolve, reject) => {
            this.http.put(`${this.apiUrl}/${id}/image`, data, {
                observe: 'response',
                headers: header,
                responseType: 'text'
            }).subscribe(res => resolve(res.body),
                err => reject(err));
        }));
    }

    toggleStatus(status: boolean, id: number, token: string): Promise<any> {
        return new Promise<any>(((resolve, reject) => {
            this.http.put(`${this.apiUrl}/${id}`, {open: status}, {
                observe: 'response',
                headers: new HttpHeaders().append('x-authorization', token),
                responseType: 'text'
            }).subscribe(res => resolve(res.body),
                err => reject(err));
        }));
    }

    createProject(project: ProjectNew, token: string): Promise<any> {
        return new Promise<any>(((resolve, reject) => {
            this.http.post(`${this.apiUrl}`, project, {
                observe: 'response',
                headers: new HttpHeaders().append('x-authorization', token),
                responseType: 'text'
            }).subscribe(res => resolve(JSON.parse(res.body)),
                err => reject(err));
        }));
    }
}

export interface SearchOptions {
    startIndex: number;
    count: number;
    options?: {
        open?: boolean;
        creator?: number;
        backer?: number
    };
}

