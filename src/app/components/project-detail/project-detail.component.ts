import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Project } from '../../models/project';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';

import _ from 'lodash';
import { Backer } from '../../models/backer';

@Component({
    selector: 'app-project-detail',
    templateUrl: 'project-detail.component.html',
    styleUrls: ['project-detail.component.scss']
})

export class ProjectDetailComponent implements OnInit {

    project = new BehaviorSubject<Project>(null);
    baseUri = environment.apiUrl;
    anonymous = 'anonymous';

    prompt = {type: 'error', message: ''};

    ERROR = 'error';
    SUCCESS = 'normal';
    INFO = 'info';

    originBackers: Backer[];

    @ViewChild('uploadFile') uploadFileEle: ElementRef;
    @ViewChild('uploadText') uploadTextEle: ElementRef;

    @ViewChild('toggleOpen') toggleOpenEle: ElementRef;
    @ViewChild('toggleClose') toggleCloseEle: ElementRef;

    @ViewChild('pledgeText') pledgeTextEle: ElementRef;
    @ViewChild('anonymousCheck') anonymousCheckEle: ElementRef;

    constructor(private activatedRouter: ActivatedRoute,
                private projectService: ProjectService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.activatedRouter.params.subscribe(params => {
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
        if (p && (p.open || this.isOwner() || this.isBacker())) {
            return p;
        }
        return null;
    }

    sendPledge(): void {
        const amount = Math.round(this.pledgeTextEle.nativeElement.value * 100);
        this.showPrompt(this.INFO, 'We are processing your pledge request...');
        if (amount > 0) {
            this.projectService.pledge(this.userService.userSubject.getValue(),
                amount,
                this.anonymousCheckEle.nativeElement.checked,
                this.project.getValue().id)
                .then(res => {
                    this.showPrompt(this.SUCCESS, 'You have successfully pledged the project');
                    setTimeout(() => location.reload(), 1000);
                })
                .catch(err => {
                    console.log(err);
                    this.showPrompt(this.ERROR, 'Oops, something went wrong while we were processing your pledge request.');
                });
        } else {
            this.showPrompt(this.ERROR, 'Pledge amount has to be greater than 0');
        }
    }

    toggleStatus(status: boolean): void {
        if (status) {
            this.toggleOpenEle.nativeElement.checked = status;
            this.toggleCloseEle.nativeElement.checked = !status;
        } else {
            this.projectService.toggleStatus(status,
                this.project.getValue().id,
                this.userService.userSubject.getValue().token)
                .then(() => {
                    this.project.getValue().open = status;
                    console.log('project toggled');
                })
                .catch(err => {
                    this.toggleOpenEle.nativeElement.checked = !status;
                    this.toggleCloseEle.nativeElement.checked = status;
                    console.error(err);
                });
        }
    }

    uploadImage(): void {
        const files = this.uploadFileEle.nativeElement.files;
        const text = this.uploadTextEle.nativeElement;
        this.showPrompt(this.INFO, 'We are uploading your image...');
        if (files.length > 0) {
            text.value = files[0].name;
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const buffer = event.target.result;
                this.projectService.uploadImage(buffer,
                    this.project.getValue().id,
                    this.userService.userSubject.getValue().token)
                    .then(() => {
                        this.showPrompt(this.SUCCESS, 'The project image has been updated. Project will be refreshed soon...');
                        setTimeout(() => location.reload(), 1000);
                    })
                    .catch(err => {
                        console.error(err);
                        this.showPrompt(this.ERROR, 'Oops, something went wrong while we were processing your request.');
                    });
            };
            reader.readAsArrayBuffer(files[0]);
        }
    }

    isLoggedIn(): boolean {
        return this.userService.isLoggedIn();
    }

    isOwner(): boolean {
        if (this.isLoggedIn() && this.project.getValue()) {
            return _.some(this.project.getValue().creators, ['id', this.userService.userSubject.getValue().id]);
        }
        return false;
    }

    isBacker(): boolean {
        if (this.isLoggedIn() && this.project.getValue()) {
            return _.some(this.originBackers, ['id', this.userService.userSubject.getValue().id]);
        }
        return false;
    }

    filterBackers(p: Project): Project {
        let anonymousIndex = -1;
        const backers = [];
        this.originBackers = p.backers;

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

    private showPrompt(type: string, msg: string): void {
        this.prompt.type = type;
        this.prompt.message = msg;
    }

    private dismissPrompt(): void {
        this.prompt.message = '';
    }
}
