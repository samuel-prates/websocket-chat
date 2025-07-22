
const MessageRepository = require('../../../src/application/ports/MessageRepository');

describe('MessageRepository', () => {
    it('should throw an error when save is called', async () => {
        const messageRepository = new MessageRepository();
        await expect(messageRepository.save({})).rejects.toThrow('Method not implemented');
    });

    it('should throw an error when findMessagesBetweenUsers is called', async () => {
        const messageRepository = new MessageRepository();
        await expect(messageRepository.findMessagesBetweenUsers('user1', 'user2')).rejects.toThrow('Method not implemented');
    });
});
