class SocketIOAdapter {
    constructor(io) {
        this.io = io;
    }

    emitChatMessage(message) {
        this.io.emit('chat message', message);
    }
}

module.exports = SocketIOAdapter;