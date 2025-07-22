
const AuthAdapter = require('src/infrastructure/adapters/auth/AuthAdapter');
const bcrypt = require('bcrypt');

jest.mock('bcrypt');

describe('AuthAdapter', () => {
    let authAdapter;

    beforeEach(() => {
        authAdapter = new AuthAdapter();
    });

    it('should hash a password', async () => {
        const password = 'password123';
        const hashedPassword = 'hashedpassword';
        bcrypt.genSalt.mockResolvedValue('mockSalt');
        bcrypt.hash.mockResolvedValue(hashedPassword);

        const result = await authAdapter.hashPassword(password);
        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 'mockSalt');
        expect(result).toBe(hashedPassword);
    });

    it('should compare a password', async () => {
        const password = 'password123';
        const hashedPassword = 'hashedpassword';
        bcrypt.compare.mockResolvedValue(true);

        const result = await authAdapter.comparePassword(password, hashedPassword);
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        expect(result).toBe(true);
    });
});
