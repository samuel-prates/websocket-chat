class Message {
    constructor(id, from, to, message, timestamp = new Date()) {
        this.id = id;
        this.from = from;
        this.to = to;
        this.message = message;
        this.timestamp = timestamp;
    }
}

module.exports = Message;