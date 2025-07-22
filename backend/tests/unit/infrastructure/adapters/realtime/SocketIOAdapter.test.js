const SocketIOAdapter = require('../../../../../src/infrastructure/adapters/realtime/SocketIOAdapter');

describe('SocketIOAdapter', () => {
  let socketIOAdapter;
  let ioMock;

  beforeEach(() => {
    // Create a mock for the Socket.IO instance
    ioMock = {
      emit: jest.fn()
    };

    // Create an instance of SocketIOAdapter with the mock
    socketIOAdapter = new SocketIOAdapter(ioMock);
  });

  describe('emitChatMessage', () => {
    it('should emit a chat message event with the provided message', () => {
      // Arrange
      const message = {
        id: 'msg123',
        from: 'user1',
        to: 'user2',
        message: 'Hello, world!',
        timestamp: new Date()
      };

      // Act
      socketIOAdapter.emitChatMessage(message);

      // Assert
      expect(ioMock.emit).toHaveBeenCalledWith('chat message', message);
    });

    it('should handle different message formats', () => {
      // Arrange
      const message = 'Simple string message';

      // Act
      socketIOAdapter.emitChatMessage(message);

      // Assert
      expect(ioMock.emit).toHaveBeenCalledWith('chat message', message);
    });

    it('should handle null or undefined messages', () => {
      // Act - null
      socketIOAdapter.emitChatMessage(null);
      
      // Assert
      expect(ioMock.emit).toHaveBeenCalledWith('chat message', null);
      
      // Reset mock
      ioMock.emit.mockClear();
      
      // Act - undefined
      socketIOAdapter.emitChatMessage(undefined);
      
      // Assert
      expect(ioMock.emit).toHaveBeenCalledWith('chat message', undefined);
    });
  });
});