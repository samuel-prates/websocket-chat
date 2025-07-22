
const UserRepository = require('../../../src/application/ports/UserRepository');

describe('UserRepository', () => {
    it('should throw an error when findByUsername is called', async () => {
        const userRepository = new UserRepository();
        await expect(userRepository.findByUsername('user')).rejects.toThrow('Method not implemented');
    });

    it('should throw an error when findById is called', async () => {
        const userRepository = new UserRepository();
        await expect(userRepository.findById('1')).rejects.toThrow('Method not implemented');
    });

    it('should throw an error when save is called', async () => {
        const userRepository = new UserRepository();
        await expect(userRepository.save({})).rejects.toThrow('Method not implemented');
    });

    it('should throw an error when updateOnlineStatus is called', async () => {
        const userRepository = new UserRepository();
        await expect(userRepository.updateOnlineStatus('1', true)).rejects.toThrow('Method not implemented');
    });

    it('should throw an error when findAll is called', async () => {
        const userRepository = new UserRepository();
        await expect(userRepository.findAll()).rejects.toThrow('Method not implemented');
    });
});
