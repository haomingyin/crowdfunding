import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Project } from '../../models/project';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';

import _ from 'lodash';

@Component({
    selector: 'app-project-detail',
    templateUrl: 'project-detail.component.html',
    styleUrls: ['project-detail.component.scss']
})

export class ProjectDetailComponent implements OnInit {

    project = new BehaviorSubject<Project>(null);
    baseUri = environment.apiUrl;
    anonymous = 'anonymous';

    constructor(private router: ActivatedRoute,
                private projectService: ProjectService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.router.params.subscribe(params => {
            this.fetchProject(+params['id']);
        });
    }

    private fetchProject(projectId: number): void {
        this.projectService.getProject(projectId)
            .then(project => {
                this.project.next(this.filterBackers(project));
            })
            .catch(err => console.log(err));
    }

    getProject(): Project {
        const p = this.project.getValue();
        const user = this.userService.userSubject.getValue();
        if (p && (p.open || this.isOwner())) {
            return p;
        }
        return null;
    }

    donate(): void {

    }

    isOwner(): boolean {
        if (this.userService.isLoggedIn() && this.project.getValue()) {
            return _.some(this.project.getValue().creators, ['id', this.userService.userSubject.getValue().id]);
        }
        return false;
    }

    filterBackers(p: Project): Project {
        let anonymousIndex = -1;
        const backers = [];

        for (let i = 0; i < Math.min(p.backers.length, 5); i++) {
            if (p.backers[i].username === this.anonymous) {
                if (anonymousIndex === -1) {
                    anonymousIndex = i;
                    backers.push(p.backers[i]);
                } else {
                    backers[anonymousIndex].amount += p.backers[i].amount;
                }
            } else {
                backers.push(p.backers[i]);
            }
        }
        p.backers = backers;
        return p;
    }


    isAnonymous(name: string): boolean {
        return name === this.anonymous;
    }

    getPercentage(currentPledged, target): string {
        return Math.round(currentPledged * 100 / target) + '%';
    }

    getPrettyMoney(amount: number): string {
        return amount.toLocaleString();
    }

    getPrettyDate(date: number): string {
        const options = {year: 'numeric', month: 'long', day: 'numeric'};
        return new Date(date).toLocaleDateString('en', options);
    }

    getInitial(name: string): string {
        return name.split(' ').map(n => n[0].toUpperCase()).join('');
    }
}
