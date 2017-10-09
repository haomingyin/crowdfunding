import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Project, ProjectBrief } from '../models/project';

@Injectable()
export class ProjectService {
    private apiUrl = environment.apiUrl + 'projects';

    constructor(private http: HttpClient) {
    }

    private getParams(so: SearchOptions): HttpParams {
        let httpParams = new HttpParams()
            .append('startIndex', '' + so.startIndex)
            .append('count', '' + so.count)
            .append('open', 'true');

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
            this.http.get(`${this.apiUrl}`, {
                observe: 'response',
                params: new HttpParams().append('id', '' + projectId),
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
}

export interface SearchOptions {
    startIndex: number;
    count: number;
    options?: {
        open: boolean;
        creator?: number;
        backer?: number
    };
}

