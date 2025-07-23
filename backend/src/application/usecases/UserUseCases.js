const User = require('../domain/User');

class UserUseCases {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    async registerUser(name, email, password) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await this.authService.hashPassword(password);
        const newUser = new User(null, name, email, hashedPassword);
        return this.userRepository.save(newUser);
    }

    async loginUser(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await this.authService.comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        return user;
    }

    async getAllUsers() {
        return this.userRepository.findAll();
    }

    async updateUserOnlineStatus(userId, status) {
        return this.userRepository.updateOnlineStatus(userId, status);
    }
}

module.exports = UserUseCases;