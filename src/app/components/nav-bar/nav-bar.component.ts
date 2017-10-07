import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import User from '../../models/user';

@Component({
    selector: 'app-nav-bar',
    templateUrl: 'nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})

export class NavBarComponent implements OnInit {

    user: User;

    constructor(private userService: UserService) {
    }

    ngOnInit() {
        this.userService.userSubject.subscribe(user => {
            this.user = user;
        });
    }
}
