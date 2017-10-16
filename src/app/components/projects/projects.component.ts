import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProjectService, SearchOptions } from '../../services/project.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ProjectBrief } from '../../models/project';

import _ from 'lodash';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';

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
    displayCategory = 'All public projects';

    baseUrl = environment.apiUrl;

    startIndex = 0;
    count = 4;

    @ViewChild('searchText') searchTextEle: ElementRef;

    so: SearchOptions = {
        startIndex: this.startIndex,
        count: this.count,
        options: {}
    };

    constructor(private projectService: ProjectService,
                private userService: UserService,
                private activatedRouter: ActivatedRoute) {
    }

    ngOnInit() {
        this.activatedRouter.queryParams.subscribe(params => {
            if (params['creator']) {
                this.getCreatorProjects();
            } else if (params['backer']) {
                this.getPledgedProjects();
            } else {
                this.getPublicProjects();
            }
        }, err => this.getPublicProjects());
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

    hasKeywords(target: string, keywords: string[]): boolean {
        return _.some(target.toLowerCase().split(/\W+/), word => {
            return _.includes(keywords, word);
        });
    }

    private keywordsFilter(projects: ProjectBrief[]): ProjectBrief[] {
        const content = this.searchTextEle.nativeElement.value.trim();
        if (!content) {
            return projects;
        }
        const keywords = content.toLowerCase().split(/\W+/);
        const res: ProjectBrief[] = [];
        projects.forEach(p => {
            const target = p.title + ' ' + p.subtitle;
            if (this.hasKeywords(target, keywords)) {
                res.push(p);
            }
        });
        return res;
    }

    private dupProjectFilter(projects: ProjectBrief[]): ProjectBrief[] {
        const result: ProjectBrief[] = [];
        projects.forEach(p => {
            if (!this.projectIds.includes(p.id)) {
                this.projectIds.push(p.id);
                result.push(p);
            }
        });
        return result;
    }

    getPledgedProjects(): void {
        if (this.isLoggedIn()) {
            this.displayCategory = 'Projects I pledged';
            this.resetSearchOptions();
            this.so.options = {backer: this.userService.userSubject.getValue().id};
        }
        this.getProjects();
    }

    getCreatorProjects(): void {
        if (this.isLoggedIn()) {
            this.displayCategory = 'Projects I created';
            this.resetSearchOptions();
            this.so.options = {creator: this.userService.userSubject.getValue().id};
        }
        this.getProjects();
    }

    getPublicProjects(): void {
        this.displayCategory = 'All public projects';
        this.resetSearchOptions();
        this.so.options = {open: true};
        this.getProjects();
    }

    private projectFilters(projects: ProjectBrief[]): ProjectBrief[] {
        projects = this.dupProjectFilter(projects);
        projects = this.keywordsFilter(projects);
        return projects;
    }

    private getProjects(): void {
        this.so.startIndex = this.startIndex;
        if (!this.reachedEnd) {
            this.isLoading = true;
            this.projectService.getProjectBriefs(this.so)
                .then(projects => {
                    this.reachedEnd = projects.length === 0;
                    projects = this.projectFilters(projects);
                    this.isLoading = false;
                    this.startIndex += this.count;
                    const currentProjects = this.projects.getValue();
                    this.projects.next(_.concat(currentProjects, projects));
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
