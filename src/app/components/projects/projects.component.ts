import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProjectService } from '../../services/project.service';
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
    reachedEnd = false;
    isLoading = false;

    baseUrl = environment.apiUrl;

    startIndex = 0;
    count = 4;

    constructor(private projectService: ProjectService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.getProjects();
    }

    onScroll(): void {
        this.getProjects();
    }

    getProjects(): void {
        if (!this.reachedEnd) {
            this.isLoading = true;
            this.projectService.getProjectBriefs({startIndex: this.startIndex, count: this.count, options: {open: true}})
                .then(newProjects => {
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
