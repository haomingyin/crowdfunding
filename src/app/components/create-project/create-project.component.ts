import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Reward } from '../../models/reward';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-project',
    templateUrl: 'create-project.component.html',
    styleUrls: ['create-project.component.scss']
})

export class CreateProjectComponent implements OnInit {
    rewards: Reward[] = [];
    currentRewardIndex: number;
    isEditing: boolean;
    prompt = {type: 'error', message: ''};

    ERROR = 'error';
    SUCCESS = 'normal';
    INFO = 'info';

    @ViewChild('title') titleRef: ElementRef;
    @ViewChild('subtitle') subtitleRef: ElementRef;
    @ViewChild('target') targetRef: ElementRef;
    @ViewChild('description') descriptionRef: ElementRef;
    @ViewChild('create') createRef: ElementRef;

    @ViewChild('rewardAmount') rewardAmountRef: ElementRef;
    @ViewChild('rewardDescription') rewardDescriptionRef: ElementRef;
    @ViewChild('rewardDelete') rewardDeleteRef: ElementRef;
    @ViewChild('rewardConfirm') rewardConfirmRef: ElementRef;

    constructor(private projectService: ProjectService,
                private userService: UserService,
                private router: Router) {
    }

    ngOnInit() {
        this.userService.userSubject.subscribe(user => {
            if (!user) {
                this.router.navigateByUrl('login');
            }
        });
    }

    addReward(): void {
        this.isEditing = false;
        this.rewardAmountRef.nativeElement.value = '';
        this.rewardDescriptionRef.nativeElement.value = '';
    }

    clickConfirm(): void {
        if (this.isEditing) {
            this.rewards[this.currentRewardIndex].amount = Math.round(Number(this.rewardAmountRef.nativeElement.value) * 100);
            this.rewards[this.currentRewardIndex].description = this.rewardDescriptionRef.nativeElement.value.trim();
        } else {
            const amount = Math.round(Number(this.rewardAmountRef.nativeElement.value) * 100);
            const description = this.rewardDescriptionRef.nativeElement.value.trim();
            if (description && amount) {
                this.rewards.push({amount: amount, description: description});
                this.dismissPrompt();
            } else {
                this.showPrompt(this.ERROR, 'Reward amount or description is invalid.');
            }
        }
    }

    getPrettyMoney(amount: number): string {
        return amount.toLocaleString();
    }

    private showPrompt(type: string, msg: string): void {
        this.prompt.type = type;
        this.prompt.message = msg;
    }

    private dismissPrompt(): void {
        this.prompt.message = '';
    }

    clickDelete(): void {
        if (this.isEditing) {
            this.rewards.splice(this.currentRewardIndex, 1);
        }
    }

    editReward(i: number): void {
        this.isEditing = true;
        this.currentRewardIndex = i;
        this.rewardAmountRef.nativeElement.value = this.rewards[i].amount / 100;
        this.rewardDescriptionRef.nativeElement.value = this.rewards[i].description;
    }

    clickCreate(): void {
        this.createRef.nativeElement.disabled = true;
        this.showPrompt(this.INFO, 'We are processing your request...');
        const title = this.titleRef.nativeElement.value.trim();
        const subtitle = this.subtitleRef.nativeElement.value.trim();
        const target = Math.round(Number(this.targetRef.nativeElement.value));
        const description = this.descriptionRef.nativeElement.value.trim();

        if (title && subtitle && target && description && this.rewards.length > 0) {
            this.projectService.createProject({
                title: title,
                subtitle: subtitle,
                target: target,
                description: description,
                creators: [{
                    id: this.userService.userSubject.getValue().id
                }],
                rewards: this.rewards
            }, this.userService.userSubject.getValue().token)
                .then(res => {
                    this.showPrompt(this.SUCCESS, 'The project has been successfully created.');
                    setTimeout(() => this.router.navigateByUrl(`projects/${res.id}`), 1000);
                })
                .catch(err => {
                    this.showPrompt(this.ERROR, 'Something went wrong when we process your request. Please try it again.');
                    this.createRef.nativeElement.disabled = false;
                });
        } else {
            this.showPrompt(this.INFO, 'Please ensure you have filled all fields.');
            this.createRef.nativeElement.disabled = false;
        }
    }
}
