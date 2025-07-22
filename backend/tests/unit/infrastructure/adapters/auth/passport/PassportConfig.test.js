const bcrypt = require('bcrypt');
const User = require('../../../../../../src/infrastructure/adapters/persistence/mongodb/models/User');
const configurePassport = require('../../../../../../src/infrastructure/adapters/auth/passport/PassportConfig');

// Mock dependencies
jest.mock('bcrypt');
jest.mock('../../../../../../src/infrastructure/adapters/persistence/mongodb/models/User');
jest.mock('passport-local');

describe('PassportConfig', () => {
  let passport;
  let LocalStrategyMock;
  let doneMock;
  let userMock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock for passport
    passport = {
      use: jest.fn(),
      serializeUser: jest.fn(),
      deserializeUser: jest.fn()
    };

    // Create mock for LocalStrategy
    LocalStrategyMock = jest.requireMock('passport-local').Strategy;
    LocalStrategyMock.mockImplementation((options, callback) => {
      // Store the callback for later use in tests
      LocalStrategyMock.verifyCallback = callback;
      return { strategyName: 'local' };
    });

    // Create mock for done callback
    doneMock = jest.fn();

    // Create mock user
    userMock = {
      id: 'user123',
      username: 'testuser',
      password: 'hashedpassword'
    };
  });

  it('should configure passport with LocalStrategy', () => {
    // Act
    configurePassport(passport);

    // Assert
    expect(passport.use).toHaveBeenCalledWith(expect.objectContaining({ strategyName: 'local' }));
    expect(LocalStrategyMock).toHaveBeenCalledWith(
      { usernameField: 'username' },
      expect.any(Function)
    );
  });

  it('should configure serializeUser', () => {
    // Act
    configurePassport(passport);

    // Assert
    expect(passport.serializeUser).toHaveBeenCalledWith(expect.any(Function));

    // Get the serializeUser callback
    const serializeCallback = passport.serializeUser.mock.calls[0][0];
    
    // Call the callback
    serializeCallback(userMock, doneMock);
    
    // Verify it works correctly
    expect(doneMock).toHaveBeenCalledWith(null, 'user123');
  });

  it('should configure deserializeUser', () => {
    // Arrange
    User.findById.mockResolvedValue(userMock);

    // Act
    configurePassport(passport);

    // Assert
    expect(passport.deserializeUser).toHaveBeenCalledWith(expect.any(Function));

    // Get the deserializeUser callback
    const deserializeCallback = passport.deserializeUser.mock.calls[0][0];
    
    // Call the callback
    return deserializeCallback('user123', doneMock).then(() => {
      // Verify it works correctly
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(doneMock).toHaveBeenCalledWith(null, userMock);
    });
  });

  it('should handle error in deserializeUser', () => {
    // Arrange
    const error = new Error('Database error');
    User.findById.mockRejectedValue(error);

    // Act
    configurePassport(passport);

    // Get the deserializeUser callback
    const deserializeCallback = passport.deserializeUser.mock.calls[0][0];
    
    // Call the callback
    return deserializeCallback('user123', doneMock).then(() => {
      // Verify it handles errors correctly
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(doneMock).toHaveBeenCalledWith(error, null);
    });
  });

  it('should authenticate user with correct credentials', () => {
    // Arrange
    User.findOne.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);

    // Act
    configurePassport(passport);

    // Get the verify callback from LocalStrategy
    const verifyCallback = LocalStrategyMock.verifyCallback;
    
    // Call the callback
    return verifyCallback('testuser', 'correctpassword', doneMock).then(() => {
      // Verify it authenticates correctly
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword');
      expect(doneMock).toHaveBeenCalledWith(null, userMock);
    });
  });

  it('should reject authentication with incorrect password', () => {
    // Arrange
    User.findOne.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(false);

    // Act
    configurePassport(passport);

    // Get the verify callback from LocalStrategy
    const verifyCallback = LocalStrategyMock.verifyCallback;
    
    // Call the callback
    return verifyCallback('testuser', 'wrongpassword', doneMock).then(() => {
      // Verify it rejects authentication
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(doneMock).toHaveBeenCalledWith(null, false, { message: 'Password incorrect' });
    });
  });

  it('should reject authentication with non-existent user', () => {
    // Arrange
    User.findOne.mockResolvedValue(null);

    // Act
    configurePassport(passport);

    // Get the verify callback from LocalStrategy
    const verifyCallback = LocalStrategyMock.verifyCallback;
    
    // Call the callback
    return verifyCallback('nonexistentuser', 'anypassword', doneMock).then(() => {
      // Verify it rejects authentication
      expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistentuser' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(doneMock).toHaveBeenCalledWith(null, false, { message: 'That username is not registered' });
    });
  });

  it('should handle error during authentication', () => {
    // Arrange
    const error = new Error('Database error');
    User.findOne.mockRejectedValue(error);
    console.log = jest.fn(); // Mock console.log to prevent test output pollution

    // Act
    configurePassport(passport);

    // Get the verify callback from LocalStrategy
    const verifyCallback = LocalStrategyMock.verifyCallback;
    
    // Call the callback
    return verifyCallback('testuser', 'anypassword', doneMock).then(() => {
      // Verify it handles errors correctly
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(console.log).toHaveBeenCalledWith(error);
      expect(doneMock).toHaveBeenCalledWith(error);
    });
  });
});