class User {
    constructor(id, name, email, password, online = false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.online = online;
    }
}

module.exports = User;