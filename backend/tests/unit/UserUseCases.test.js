
const UserUseCases = require('../../src/application/usecases/UserUseCases');
const User = require('../../src/application/domain/User');

describe('UserUseCases', () => {
    let userRepository;
    let authService;
    let userUseCases;

    beforeEach(() => {
        userRepository = {
            findByUsername: jest.fn(),
            save: jest.fn(),
            findAll: jest.fn(),
            updateOnlineStatus: jest.fn(),
        };
        authService = {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
        };
        userUseCases = new UserUseCases(userRepository, authService);
    });

    it('should register a new user', async () => {
        const name = 'Test User';
        const username = 'testuser';
        const password = 'password123';
        const hashedPassword = 'hashedpassword';

        userRepository.findByUsername.mockResolvedValue(null);
        authService.hashPassword.mockResolvedValue(hashedPassword);

        await userUseCases.registerUser(name, username, password);

        expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
        expect(authService.hashPassword).toHaveBeenCalledWith(password);
        expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
    });

    it('should throw an error if user already exists', async () => {
        const name = 'Test User';
        const username = 'testuser';
        const password = 'password123';

        userRepository.findByUsername.mockResolvedValue(new User('1', name, username, password));

        await expect(userUseCases.registerUser(name, username, password)).rejects.toThrow('User already exists');
    });

    it('should login a user with valid credentials', async () => {
        const username = 'testuser';
        const password = 'password123';
        const user = new User('1', 'Test User', username, 'hashedpassword');

        userRepository.findByUsername.mockResolvedValue(user);
        authService.comparePassword.mockResolvedValue(true);

        const result = await userUseCases.loginUser(username, password);

        expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
        expect(authService.comparePassword).toHaveBeenCalledWith(password, user.password);
        expect(result).toBe(user);
    });

    it('should throw an error with invalid credentials on login', async () => {
        const username = 'testuser';
        const password = 'password123';

        userRepository.findByUsername.mockResolvedValue(null);

        await expect(userUseCases.loginUser(username, password)).rejects.toThrow('Invalid credentials');
    });

    it('should throw an error with invalid password on login', async () => {
        const username = 'testuser';
        const password = 'wrongpassword';
        const user = new User('1', 'Test User', username, 'hashedpassword');

        userRepository.findByUsername.mockResolvedValue(user);
        authService.comparePassword.mockResolvedValue(false);

        await expect(userUseCases.loginUser(username, password)).rejects.toThrow('Invalid credentials');
    });

    it('should get all users', async () => {
        const users = [
            new User('1', 'User 1', 'user1', 'pass1'),
            new User('2', 'User 2', 'user2', 'pass2'),
        ];

        userRepository.findAll.mockResolvedValue(users);

        const result = await userUseCases.getAllUsers();

        expect(userRepository.findAll).toHaveBeenCalled();
        expect(result).toBe(users);
    });

    it('should update user online status', async () => {
        const userId = '1';
        const status = true;

        await userUseCases.updateUserOnlineStatus(userId, status);

        expect(userRepository.updateOnlineStatus).toHaveBeenCalledWith(userId, status);
    });
});
