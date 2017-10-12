import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProjectService, SearchOptions } from '../../services/project.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ProjectBrief } from '../../models/project';

import _ from 'lodash';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-projects',
    templateUrl: 'projects.component.html',
    styleUrls: ['projects.component.scss']
})

export class ProjectsComponent implements OnInit {
    projects = new BehaviorSubject<ProjectBrief[]>([]);
    projectIds: number[] = [];
    reachedEnd = false;
    isLoading = false;

    baseUrl = environment.apiUrl;

    startIndex = 0;
    count = 12;

    so: SearchOptions = {
        startIndex: this.startIndex,
        count: this.count,
        options: {}
    };

    constructor(private projectService: ProjectService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.getPublicProjects();
    }

    onScroll(): void {
        this.getProjects();
    }

    private resetSearchOptions() {
        this.startIndex = 0;
        this.reachedEnd = false;
        this.projects.next([]);
        this.projectIds = [];
    }

    getPledgedProjects(): void {
        this.resetSearchOptions();
        this.so.options = {backer: this.userService.userSubject.getValue().id};
        this.getProjects();
    }

    getCreatorProjects(): void {
        this.resetSearchOptions();
        this.so.options = {creator: this.userService.userSubject.getValue().id};
        this.getProjects();
    }

    getPublicProjects(): void {
        this.resetSearchOptions();
        this.so.options = {open: true};
        this.getProjects();
    }

    private getProjects(): void {
        this.so.startIndex = this.startIndex;
        if (!this.reachedEnd) {
            this.isLoading = true;
            this.projectService.getProjectBriefs(this.so)
                .then(res => {
                    const newProjects = [];
                    res.forEach(p => {
                        if (!this.projectIds.includes(p.id)) {
                            this.projectIds.push(p.id);
                            newProjects.push(p);
                        }
                    });
                    this.reachedEnd = newProjects.length === 0;
                    this.isLoading = false;
                    this.startIndex += this.count;
                    const currentProjects = this.projects.getValue();
                    this.projects.next(_.concat(currentProjects, newProjects));
                })
                .catch(err => console.log(err));
        }
    }

    scrollToTop(): void {
        window.scrollTo(0, 0);
    }

    isLoggedIn(): boolean {
        return this.userService.isLoggedIn();
    }
}
