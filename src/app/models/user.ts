export default class User {
    id: number;
    username: string;
    email: string;
    password: string;
    location: string;
    token: string;

    constructor(id: number, username: string, location: string, email: string, token: string) {
        this.id = id;
        this.username = username;
        this.location = location;
        this.email = email;
        this.token = token;
    }

    static restoreUser(userJson: {id: number, username: string, location: string, email: string, token: string}): User {
        return new User(userJson.id, userJson.username, userJson.location, userJson.email, userJson.token);
    }
}
