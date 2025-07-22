
const request = require('supertest');
const express = require('express');
const usersRoutes = require('src/infrastructure/adapters/http/routes/users');
const UserUseCases = require('src/application/usecases/UserUseCases');
const passport = require('passport');

jest.mock('passport');

describe('Users Routes', () => {
    let app;
    let userUseCases;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        userUseCases = {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            getAllUsers: jest.fn(),
            updateUserOnlineStatus: jest.fn(),
        };

        passport.authenticate.mockImplementation((strategy, callback) => (req, res, next) => {
            if (req.body.username === 'testuser' && req.body.password === 'password') {
                callback(null, { id: '1', username: 'testuser' }, null);
            } else {
                callback(null, false, { message: 'Invalid credentials' });
            }
        });

        app.use((req, res, next) => {
            req.logIn = jest.fn((user, callback) => callback(null));
            req.logout = jest.fn((cb) => {
                cb();
            });
            req.user = { id: '1', username: 'testuser' }; // Mock req.user for logout test
            next();
        });

        app.use('/api/users', usersRoutes(userUseCases));
    });

    it('should register a user', async () => {
        const user = { name: 'Test User', username: 'testuser', password: 'password' };
        userUseCases.registerUser.mockResolvedValue(user);
        const response = await request(app)
            .post('/api/users/register')
            .send(user);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: 'User registered successfully', user: user });
    });

    it('should login a user', async () => {
        const user = { username: 'testuser', password: 'password' };
        userUseCases.loginUser.mockResolvedValue(user);
        const response = await request(app)
            .post('/api/users/login')
            .send(user);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: 'Successfully Authenticated', user: { id: '1', username: 'testuser' } });
    });

    it('should get all users', async () => {
        const users = [{ name: 'User 1' }, { name: 'User 2' }];
        userUseCases.getAllUsers.mockResolvedValue(users);
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(users);
    });

    it('should fail to login with invalid credentials', async () => {
        const user = { username: 'wronguser', password: 'wrongpass' };
        const response = await request(app)
            .post('/api/users/login')
            .send(user);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ msg: 'No user exists' });
    });

    it('should logout a user', async () => {
        const response = await request(app).get('/api/users/logout');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: 'Successfully logged out' });
    });
});
