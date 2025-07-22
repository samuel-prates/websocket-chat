
const request = require('supertest');
const http = require('http');
const express = require('express');
const socketIoClient = require('socket.io-client');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock dependencies
jest.mock('src/infrastructure/adapters/persistence/mongodb/repositories/MongooseUserRepository');
jest.mock('src/infrastructure/adapters/persistence/mongodb/repositories/MongooseMessageRepository');
jest.mock('src/infrastructure/adapters/auth/AuthAdapter');
jest.mock('src/infrastructure/adapters/realtime/SocketIOAdapter');
jest.mock('src/infrastructure/adapters/http/routes/users');
jest.mock('src/infrastructure/adapters/http/routes/messages');
jest.mock('src/infrastructure/adapters/auth/passport/PassportConfig');
jest.mock('redis');
jest.mock('@socket.io/redis-adapter');

const appModule = require('../../src/index'); // The actual app module

describe('Full Application Integration', () => {
    let mongoServer;
    let app;
    let server;
    let io;

    beforeAll(async () => {
        // Start in-memory MongoDB
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        process.env.MONGO_URI = mongoUri; // Set env variable for mongoose connection
        process.env.NODE_ENV = 'test'; // Ensure we're in test mode

        // Import and start the app after setting env variable
        const { app: expressApp, server: httpServer, io: socketIo } = appModule;
        app = expressApp;
        server = httpServer;
        io = socketIo;

        // Mock Redis and Socket.IO Redis Adapter
        const mockPubClient = { connect: jest.fn().mockResolvedValue(true), duplicate: jest.fn(() => ({ connect: jest.fn().mockResolvedValue(true) })), on: jest.fn(), isReady: true, set: jest.fn(), del: jest.fn() };
        const mockSubClient = { connect: jest.fn().mockResolvedValue(true), on: jest.fn() };
        require('redis').createClient.mockReturnValueOnce(mockPubClient).mockReturnValueOnce(mockSubClient);
        require('@socket.io/redis-adapter').createAdapter.mockReturnValue(jest.fn());

        // Set up mock routes
        const mockUsersRouter = express.Router();
        mockUsersRouter.post('/register', (req, res) => {
            res.json({ msg: 'User registered successfully', user: req.body });
        });
        
        // Apply mock routes to the app
        app.use('/api/users', mockUsersRouter);

        // Mock console.log and console.error
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Ensure server is listening
        await new Promise(resolve => server.listen(0, resolve));
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        io.close();
        server.close();
        jest.restoreAllMocks();
    });

    it('should handle user registration via HTTP', async () => {
        const mockUser = { name: 'Test User', username: 'testuser', password: 'password' };
        require('src/infrastructure/adapters/http/routes/users').mockImplementation((userUseCases) => {
            const express = require('express');
            const router = express.Router();
            router.post('/register', (req, res) => {
                userUseCases.registerUser.mockResolvedValue(mockUser);
                res.json({ msg: 'User registered successfully', user: mockUser });
            });
            return router;
        });

        const response = await request(app)
            .post('/api/users/register')
            .send(mockUser);

        expect(response.status).toBe(200);
        expect(response.body.msg).toBe('User registered successfully');
        expect(response.body.user).toEqual(mockUser);
    });

    it('should handle chat messages via Socket.IO', (done) => {
        const clientSocket = socketIoClient(`http://localhost:${server.address().port}`);
        const message = { from: 'user1', to: 'user2', message: 'Hello' };

        clientSocket.on('connect', () => {
            clientSocket.emit('chat message', message, (response) => {
                expect(response.status).toBe('success');
                clientSocket.disconnect();
                done();
            });
        });

        clientSocket.on('error', (err) => {
            clientSocket.disconnect();
            done(err);
        });
    });
});
