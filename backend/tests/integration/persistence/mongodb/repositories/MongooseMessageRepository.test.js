
const MongooseMessageRepository = require('../../../../../src/infrastructure/adapters/persistence/mongodb/repositories/MongooseMessageRepository');
const Message = require('../../../../../src/infrastructure/adapters/persistence/mongodb/models/Message');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

describe('MongooseMessageRepository', () => {
    let mongoServer;
    let messageRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        messageRepository = new MongooseMessageRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Message.deleteMany({});
    });

    it('should save a message', async () => {
        const user1Id = new ObjectId();
        const user2Id = new ObjectId();
        const message = { from: user1Id, to: user2Id, message: 'Hello' };
        const savedMessage = await messageRepository.save(message);
        expect(savedMessage).toHaveProperty('id');
        expect(savedMessage.message).toBe(message.message);
    });

    it('should find messages between two users', async () => {
        const user1Id = new ObjectId();
        const user2Id = new ObjectId();
        const user3Id = new ObjectId();
        await Message.create(
            { from: user1Id, to: user2Id, message: 'Hello' },
            { from: user2Id, to: user1Id, message: 'Hi' },
            { from: user1Id, to: user3Id, message: 'Hey' }
        );
        const messages = await messageRepository.findMessagesBetweenUsers(user1Id, user2Id);
        expect(messages).toHaveLength(2);
    });
});
