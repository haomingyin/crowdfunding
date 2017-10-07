export default class User {
    id: number;
    username: string;
    email: string;
    password: string;
    location: string;
    token: string;

    constructor(id: number, username: string, location: string, email: string) {
        this.id = id;
        this.username = username;
        this.location = location;
        this.email = email;
    }
}
