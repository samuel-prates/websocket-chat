
const SocketIOAdapter = require('src/infrastructure/adapters/realtime/SocketIOAdapter');

describe('SocketIOAdapter', () => {
    let ioMock;
    let socketIOAdapter;

    beforeEach(() => {
        ioMock = {
            emit: jest.fn(),
        };
        socketIOAdapter = new SocketIOAdapter(ioMock);
    });

    it('should emit a chat message', () => {
        const message = { from: 'user1', to: 'user2', message: 'Hello' };
        socketIOAdapter.emitChatMessage(message);
        expect(ioMock.emit).toHaveBeenCalledWith('chat message', message);
    });
});
