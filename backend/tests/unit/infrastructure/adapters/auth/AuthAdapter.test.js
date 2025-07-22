const bcrypt = require('bcrypt');
const AuthAdapter = require('../../../../../src/infrastructure/adapters/auth/AuthAdapter');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('AuthAdapter', () => {
  let authAdapter;

  beforeEach(() => {
    authAdapter = new AuthAdapter();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      // Arrange
      const password = 'testPassword123';
      const salt = 'testSalt';
      const hashedPassword = 'hashedTestPassword';
      
      bcrypt.genSalt.mockResolvedValue(salt);
      bcrypt.hash.mockResolvedValue(hashedPassword);

      // Act
      const result = await authAdapter.hashPassword(password);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(result).toBe(hashedPassword);
    });

    it('should propagate errors from bcrypt', async () => {
      // Arrange
      const password = 'testPassword123';
      const error = new Error('Bcrypt error');
      
      bcrypt.genSalt.mockRejectedValue(error);

      // Act & Assert
      await expect(authAdapter.hashPassword(password)).rejects.toThrow('Bcrypt error');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = 'hashedTestPassword';
      
      bcrypt.compare.mockResolvedValue(true);

      // Act
      const result = await authAdapter.comparePassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = 'hashedTestPassword';
      
      bcrypt.compare.mockResolvedValue(false);

      // Act
      const result = await authAdapter.comparePassword(password, hashedPassword);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });

    it('should propagate errors from bcrypt', async () => {
      // Arrange
      const password = 'testPassword123';
      const hashedPassword = 'hashedTestPassword';
      const error = new Error('Bcrypt error');
      
      bcrypt.compare.mockRejectedValue(error);

      // Act & Assert
      await expect(authAdapter.comparePassword(password, hashedPassword)).rejects.toThrow('Bcrypt error');
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});