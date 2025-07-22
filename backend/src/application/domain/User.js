class User {
    constructor(id, name, username, password, online = false) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.password = password;
        this.online = online;
    }
}

module.exports = User;