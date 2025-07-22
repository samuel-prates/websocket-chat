
const MessageUseCases = require('../../src/application/usecases/MessageUseCases');
const Message = require('../../src/application/domain/Message');

describe('MessageUseCases', () => {
    let messageRepository;
    let realtimeService;
    let messageUseCases;

    beforeEach(() => {
        messageRepository = {
            save: jest.fn(),
            findMessagesBetweenUsers: jest.fn(),
        };
        realtimeService = {
            emitChatMessage: jest.fn(),
        };
        messageUseCases = new MessageUseCases(messageRepository, realtimeService);
    });

    it('should send a message and emit a chat message', async () => {
        const from = 'user1';
        const to = 'user2';
        const messageContent = 'Hello, world!';
        const savedMessage = new Message('1', from, to, messageContent);

        messageRepository.save.mockResolvedValue(savedMessage);

        const result = await messageUseCases.sendMessage(from, to, messageContent);

        expect(messageRepository.save).toHaveBeenCalledWith(expect.any(Message));
        expect(realtimeService.emitChatMessage).toHaveBeenCalledWith(savedMessage);
        expect(result).toBe(savedMessage);
    });

    it('should get messages between two users', async () => {
        const user1Id = 'user1';
        const user2Id = 'user2';
        const messages = [
            new Message('1', user1Id, user2Id, 'Hello'),
            new Message('2', user2Id, user1Id, 'Hi'),
        ];

        messageRepository.findMessagesBetweenUsers.mockResolvedValue(messages);

        const result = await messageUseCases.getMessagesBetweenUsers(user1Id, user2Id);

        expect(messageRepository.findMessagesBetweenUsers).toHaveBeenCalledWith(user1Id, user2Id);
        expect(result).toBe(messages);
    });
});
