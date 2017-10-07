import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-signup',
    templateUrl: 'signup.component.html',
    styleUrls: ['signup.component.scss']
})

export class SignupComponent {
    @ViewChild('username') usernameEle: ElementRef;
    @ViewChild('email') emailEle: ElementRef;
    @ViewChild('password') passwordEle: ElementRef;
    @ViewChild('rePassword') rePasswordEle: ElementRef;
    @ViewChild('location') locationEle: ElementRef;
    @ViewChild('checkbox') checkboxEle: ElementRef;

    prompt = {type: 'error', message: ''};

    constructor(private userService: UserService) {
    }

    setCheckbox(val: boolean): void {
        this.checkboxEle.nativeElement.checked = val;
    }

    private validatePassword(): boolean {
        const res = this.passwordEle.nativeElement.value === this.rePasswordEle.nativeElement.value;
        if (!res) {
            this.prompt.type = 'error';
            this.prompt.message = 'Two passwords are not identical.';
        }
        return res;
    }

    signup(): void {
        if (!this.validatePassword()) {
            return;
        }
        const body = {
            username: this.usernameEle.nativeElement.value.trim(),
            email: this.emailEle.nativeElement.value.trim(),
            password: this.passwordEle.nativeElement.value.trim(),
        };
        if (!body.username || !body.email || !body.password) {
            return;
        }
        if (this.locationEle.nativeElement.value.trim() !== '') {
            body['location'] = this.locationEle.nativeElement.value;
        }
        this.userService.signup(body)
            .then(user => {
                this.prompt.type = 'normal';
                this.prompt.message = `Hi ${user.username}! Thanks for signing up :)`;
            })
            .catch(err => {
                this.prompt.type = 'error';
                this.prompt.message = `Sorry, the username or email was registered by others.`;
            });
    }
}
