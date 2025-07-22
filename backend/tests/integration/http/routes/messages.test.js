
const request = require('supertest');
const express = require('express');
const messagesRoutes = require('src/infrastructure/adapters/http/routes/messages');
const MessageUseCases = require('src/application/usecases/MessageUseCases');

describe('Messages Routes', () => {
    let app;
    let messageUseCases;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        messageUseCases = {
            getMessagesBetweenUsers: jest.fn(),
        };
        app.use('/api/messages', messagesRoutes(messageUseCases));
    });

    it('should get messages between users', async () => {
        const messages = [{ from: 'user1', to: 'user2', message: 'Hello' }];
        messageUseCases.getMessagesBetweenUsers.mockResolvedValue(messages);
        const response = await request(app).get('/api/messages/user1/user2');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(messages);
    });
});
