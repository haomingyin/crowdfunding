import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './components/main/main.component';
import { UserService } from './services/user.service';
import { SignupComponent } from './components/signup/signup.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ProjectService } from './services/project.service';

@NgModule({
    declarations: [
        AppComponent,
        NavBarComponent,
        FooterComponent,
        LoginComponent,
        SignupComponent,
        MainComponent,
        ProjectsComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        InfiniteScrollModule
    ],
    providers: [
        UserService,
        ProjectService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
