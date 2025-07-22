
const AuthService = require('../../../src/application/ports/AuthService');

describe('AuthService', () => {
    it('should throw an error when authenticate is called', async () => {
        const authService = new AuthService();
        await expect(authService.authenticate('user', 'pass')).rejects.toThrow('Method not implemented');
    });
});
