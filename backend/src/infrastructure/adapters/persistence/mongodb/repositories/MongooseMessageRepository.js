const MessageDomain = require('../../../../../application/domain/Message');
const MessageModel = require('../models/Message');

class MongooseMessageRepository {
    async save(message) {
        const messageModel = new MessageModel({
            from: message.from,
            to: message.to,
            message: message.message,
            timestamp: message.timestamp
        });
        const savedMessage = await messageModel.save();
        return new MessageDomain(savedMessage._id, savedMessage.from, savedMessage.to, savedMessage.message, savedMessage.timestamp);
    }

    async findMessagesBetweenUsers(user1Id, user2Id) {
        const messages = await MessageModel.find({
            $or: [
                { from: user1Id, to: user2Id },
                { from: user2Id, to: user1Id }
            ]
        }).sort({ timestamp: 1 });
        return messages.map(msg => new MessageDomain(msg._id, msg.from, msg.to, msg.message, msg.timestamp));
    }
}

module.exports = MongooseMessageRepository;