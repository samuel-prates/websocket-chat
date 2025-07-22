
const MongooseUserRepository = require('../../../../../src/infrastructure/adapters/persistence/mongodb/repositories/MongooseUserRepository');
const User = require('../../../../../src/infrastructure/adapters/persistence/mongodb/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

describe('MongooseUserRepository', () => {
    let mongoServer;
    let userRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        userRepository = new MongooseUserRepository();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('should save a user', async () => {
        const user = { name: 'Test User', username: 'testuser', password: 'password' };
        const savedUser = await userRepository.save(user);
        expect(savedUser).toHaveProperty('id');
        expect(savedUser.name).toBe(user.name);
    });

    it('should find a user by username', async () => {
        const user = new User({ name: 'Test User', username: 'testuser', password: 'password' });
        await user.save();
        const foundUser = await userRepository.findByUsername('testuser');
        expect(foundUser).not.toBeNull();
        expect(foundUser.username).toBe('testuser');
    });

    it('should find all users', async () => {
        await User.create(
            { name: 'User 1', username: 'user1', password: 'pass1' },
            { name: 'User 2', username: 'user2', password: 'pass2' }
        );
        const users = await userRepository.findAll();
        expect(users).toHaveLength(2);
    });

    it('should update user online status', async () => {
        const user = await User.create({ name: 'Test User', username: 'testuser', password: 'password', online: false });
        await userRepository.updateOnlineStatus(user._id, true);
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.online).toBe(true);
    });
});
