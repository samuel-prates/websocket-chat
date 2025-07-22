
const PassportConfig = require('src/infrastructure/adapters/auth/passport/PassportConfig');
const LocalStrategy = require('passport-local').Strategy;
const User = require('src/infrastructure/adapters/persistence/mongodb/models/User');
const bcrypt = require('bcrypt');

jest.mock('passport-local', () => ({
    Strategy: jest.fn().mockImplementation(function(options, verify) {
        this.name = 'local';
        this.verify = verify;
    }),
}));
jest.mock('bcrypt');
jest.mock('src/infrastructure/adapters/persistence/mongodb/models/User');

describe('PassportConfig', () => {
    let passport;

    beforeEach(() => {
        passport = {
            use: jest.fn(),
            serializeUser: jest.fn(),
            deserializeUser: jest.fn(),
        };

        // Mock bcrypt methods
        bcrypt.compare.mockResolvedValue(true);

        // Mock console.log to prevent test output clutter
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should configure passport with LocalStrategy', () => {
        PassportConfig(passport);
        expect(passport.use).toHaveBeenCalledTimes(1);
        expect(passport.use).toHaveBeenCalledWith(expect.any(LocalStrategy));
    });

    it('should serialize user', () => {
        PassportConfig(passport);
        const serializeUserCallback = passport.serializeUser.mock.calls[0][0];
        const user = { id: '123' };
        const done = jest.fn();
        serializeUserCallback(user, done);
        expect(done).toHaveBeenCalledWith(null, user.id);
    });

    it('should deserialize user', async () => {
        PassportConfig(passport);
        const deserializeUserCallback = passport.deserializeUser.mock.calls[0][0];
        const user = { id: '123', name: 'Test User', username: 'testuser', password: 'hashedpass' };
        User.findById.mockResolvedValue(user);
        const done = jest.fn();
        await deserializeUserCallback('123', done);
        expect(User.findById).toHaveBeenCalledWith('123');
        expect(done).toHaveBeenCalledWith(null, user);
    });

    it('should handle deserialize user error', async () => {
        PassportConfig(passport);
        const deserializeUserCallback = passport.deserializeUser.mock.calls[0][0];
        const error = new Error('User not found');
        User.findById.mockRejectedValue(error);
        const done = jest.fn();
        await deserializeUserCallback('123', done);
        expect(User.findById).toHaveBeenCalledWith('123');
        expect(done).toHaveBeenCalledWith(error, null);
    });

    it('should authenticate a user with correct credentials', async () => {
        PassportConfig(passport);
        const localStrategyVerify = LocalStrategy.mock.calls[0][1];
        const user = { id: '1', username: 'testuser', password: 'hashedpassword' };
        User.findOne.mockResolvedValue(user);

        const done = jest.fn();
        await localStrategyVerify('testuser', 'password', done);

        expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
        expect(done).toHaveBeenCalledWith(null, user);
    });

    it('should not authenticate a user with incorrect password', async () => {
        PassportConfig(passport);
        const localStrategyVerify = LocalStrategy.mock.calls[0][1];
        const user = { id: '1', username: 'testuser', password: 'hashedpassword' };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        const done = jest.fn();
        await localStrategyVerify('testuser', 'wrongpassword', done);

        expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
        expect(done).toHaveBeenCalledWith(null, false, { message: 'Password incorrect' });
    });

    it('should not authenticate a user if username is not registered', async () => {
        PassportConfig(passport);
        const localStrategyVerify = LocalStrategy.mock.calls[0][1];
        User.findOne.mockResolvedValue(null);

        const done = jest.fn();
        await localStrategyVerify('nonexistentuser', 'password', done);

        expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistentuser' });
        expect(done).toHaveBeenCalledWith(null, false, { message: 'That username is not registered' });
    });

    it('should handle authentication error', async () => {
        PassportConfig(passport);
        const localStrategyVerify = LocalStrategy.mock.calls[0][1];
        const error = new Error('Database error');
        User.findOne.mockRejectedValue(error);

        const done = jest.fn();
        await localStrategyVerify('testuser', 'password', done);

        expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(done).toHaveBeenCalledWith(error);
    });
});
