const Message = require('../domain/Message');

class MessageUseCases {
    constructor(messageRepository, realtimeService) {
        this.messageRepository = messageRepository;
        this.realtimeService = realtimeService;
    }

    async sendMessage(from, to, messageContent) {
        const newMessage = new Message(null, from, to, messageContent);
        const savedMessage = await this.messageRepository.save(newMessage);
        this.realtimeService.emitChatMessage(savedMessage);
        return savedMessage;
    }

    async getMessagesBetweenUsers(user1Id, user2Id) {
        return this.messageRepository.findMessagesBetweenUsers(user1Id, user2Id);
    }
}

module.exports = MessageUseCases;