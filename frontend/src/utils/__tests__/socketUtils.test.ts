import { initializeSocket, setupConnectionListeners, setupPingInterval, sendMessage, setUserOnlineStatus } from '@/utils/socketUtils';
import io, { Socket } from 'socket.io-client';

jest.mock('socket.io-client');

const mockedIo = io as jest.MockedFunction<typeof io>;

describe('socketUtils', () => {
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      connected: true,
      id: 'mock-socket-id',
    } as unknown as jest.Mocked<Socket>;
    mockedIo.mockReturnValue(mockSocket);

    // Mock localStorage.removeItem for logout tests
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock alert for reconnect_failed
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('initializeSocket', () => {
    it('should initialize socket with correct URL and options', () => {
      const socket = initializeSocket();
      expect(mockedIo).toHaveBeenCalledWith('http://localhost:5000', {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        randomizationFactor: 0.5,
      });
      expect(socket).toBe(mockSocket);
    });
  });

  describe('setupConnectionListeners', () => {
    it('should set up all connection event listeners', () => {
      const setConnectionStatus = jest.fn();
      setupConnectionListeners(mockSocket, setConnectionStatus);

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('reconnect_attempt', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('reconnect_error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('reconnect_failed', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should update connection status on connect', () => {
      const setConnectionStatus = jest.fn();
      setupConnectionListeners(mockSocket, setConnectionStatus);

      const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
      connectCallback();
      expect(setConnectionStatus).toHaveBeenCalledWith('connected');
    });

    it('should update connection status on disconnect', () => {
      const setConnectionStatus = jest.fn();
      setupConnectionListeners(mockSocket, setConnectionStatus);

      const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
      disconnectCallback('io client disconnect');
      expect(setConnectionStatus).toHaveBeenCalledWith('disconnected');
    });

    it('should update connection status on connect_error', () => {
      const setConnectionStatus = jest.fn();
      setupConnectionListeners(mockSocket, setConnectionStatus);

      const connectErrorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect_error')[1];
      connectErrorCallback(new Error('test error'));
      expect(setConnectionStatus).toHaveBeenCalledWith('disconnected');
    });

    it('should update connection status on reconnect_attempt', () => {
      const setConnectionStatus = jest.fn();
      setupConnectionListeners(mockSocket, setConnectionStatus);

      const reconnectAttemptCallback = mockSocket.on.mock.calls.find(call => call[0] === 'reconnect_attempt')[1];
      reconnectAttemptCallback(1);
      expect(setConnectionStatus).toHaveBeenCalledWith('connecting');
    });

    it('should update connection status on reconnect', () => {
      const setConnectionStatus = jest.fn();
      setupConnectionListeners(mockSocket, setConnectionStatus);

      const reconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'reconnect')[1];
      reconnectCallback(1);
      expect(setConnectionStatus).toHaveBeenCalledWith('connected');
    });

    it('should call alert on reconnect_failed', () => {
      const setConnectionStatus = jest.fn();
      setupConnectionListeners(mockSocket, setConnectionStatus);

      const reconnectFailedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'reconnect_failed')[1];
      reconnectFailedCallback();
      expect(window.alert).toHaveBeenCalledWith('Connection to chat server lost. Please refresh the page to reconnect.');
    });

    it('should log error on error event', () => {
      const setConnectionStatus = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      setupConnectionListeners(mockSocket, setConnectionStatus);

      const errorCallback = mockSocket.on.mock.calls.find(call => call[0] === 'error')[1];
      errorCallback({ message: 'Server error message' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Server error:', { message: 'Server error message' });
      expect(consoleWarnSpy).toHaveBeenCalledWith('Server message: Server error message');
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('sendMessage', () => {
    const mockSetMessages = jest.fn();
    const mockMessage = 'test message';
    const mockFrom = 'user1';
    const mockTo = 'user2';

    beforeEach(() => {
      jest.useFakeTimers();
      mockSetMessages.mockClear();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should not send message if socket is not connected or missing data', () => {
      mockSocket.connected = false;
      sendMessage(mockSocket, mockMessage, mockFrom, mockTo, mockSetMessages);
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(mockSetMessages).not.toHaveBeenCalled();

      mockSocket.connected = true;
      sendMessage(mockSocket, '', mockFrom, mockTo, mockSetMessages);
      expect(mockSocket.emit).not.toHaveBeenCalled();
      expect(mockSetMessages).not.toHaveBeenCalled();
    });

    it('should add a pending message to the UI immediately', () => {
      sendMessage(mockSocket, mockMessage, mockFrom, mockTo, mockSetMessages);

      expect(mockSetMessages).toHaveBeenCalledTimes(1);
      const pendingMsg = mockSetMessages.mock.calls[0][0]([]);
      expect(pendingMsg[0]).toMatchObject({
        from: mockFrom,
        to: mockTo,
        message: mockMessage,
        pending: true,
      });
      expect(pendingMsg[0].id).toBeDefined();
      expect(pendingMsg[0].timestamp).toBeDefined();
    });

    it('should emit chat message with acknowledgment', () => {
      sendMessage(mockSocket, mockMessage, mockFrom, mockTo, mockSetMessages);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'chat message',
        expect.objectContaining({
          from: mockFrom,
          to: mockTo,
          message: mockMessage,
        }),
        expect.any(Function)
      );
    });

    it('should update message status to delivered on success acknowledgment', () => {
      sendMessage(mockSocket, mockMessage, mockFrom, mockTo, mockSetMessages);

      const messageSent = mockSetMessages.mock.calls[0][0]([]);
      const msgId = messageSent[0].id;

      const ackCallback = mockSocket.emit.mock.calls[0][2];
      ackCallback({ status: 'success' });

      expect(mockSetMessages).toHaveBeenCalledTimes(2);
      const updatedMessages = mockSetMessages.mock.calls[1][0](messageSent);
      expect(updatedMessages[0]).toMatchObject({
        id: msgId,
        pending: false,
        delivered: true,
      });
    });

    it('should update message status to failed on failed acknowledgment', () => {
      sendMessage(mockSocket, mockMessage, mockFrom, mockTo, mockSetMessages);

      const messageSent = mockSetMessages.mock.calls[0][0]([]);
      const msgId = messageSent[0].id;

      const ackCallback = mockSocket.emit.mock.calls[0][2];
      ackCallback({ status: 'error', message: 'Server error' });

      expect(mockSetMessages).toHaveBeenCalledTimes(2);
      const updatedMessages = mockSetMessages.mock.calls[1][0](messageSent);
      expect(updatedMessages[0]).toMatchObject({
        id: msgId,
        pending: false,
        failed: true,
      });
      expect(window.alert).toHaveBeenCalledWith('Failed to deliver message. Please try again.');
    });

    it('should update message status to timeout if acknowledgment not received in time', () => {
      sendMessage(mockSocket, mockMessage, mockFrom, mockTo, mockSetMessages);

      const messageSent = mockSetMessages.mock.calls[0][0]([]);
      const msgId = messageSent[0].id;

      jest.advanceTimersByTime(5000);

      expect(mockSetMessages).toHaveBeenCalledTimes(2);
      const updatedMessages = mockSetMessages.mock.calls[1][0](messageSent);
      expect(updatedMessages[0]).toMatchObject({
        id: msgId,
        pending: false,
        timeout: true,
      });
    });

    it('should clear timeout on cleanup', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const cleanup = sendMessage(mockSocket, mockMessage, mockFrom, mockTo, mockSetMessages);
      cleanup();
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('setUserOnlineStatus', () => {
    it('should emit user online event when online is true', () => {
      setUserOnlineStatus(mockSocket, 'user1', true);
      expect(mockSocket.emit).toHaveBeenCalledWith('user online', 'user1');
    });

    it('should emit user offline event when online is false', () => {
      setUserOnlineStatus(mockSocket, 'user1', false);
      expect(mockSocket.emit).toHaveBeenCalledWith('user offline', 'user1');
    });

    it('should not emit if socket is null or not connected', () => {
      setUserOnlineStatus(null, 'user1', true);
      expect(mockSocket.emit).not.toHaveBeenCalled();

      mockSocket.connected = false;
      setUserOnlineStatus(mockSocket, 'user1', true);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });
});