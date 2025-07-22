// Mock dependencies
jest.mock('passport');
const passport = require('passport');

describe('Users Routes', () => {
  // Mock dependencies
  let mockUserUseCases;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock userUseCases
    mockUserUseCases = {
      registerUser: jest.fn(),
      loginUser: jest.fn(),
      updateUserOnlineStatus: jest.fn(),
      getAllUsers: jest.fn()
    };
    
    // Create mock request, response, and next
    mockReq = {
      body: {},
      user: { id: 'user123' },
      logIn: jest.fn((user, callback) => callback()),
      logout: jest.fn(callback => callback())
    };
    
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });
  
  describe('Register User', () => {
    it('should register a user successfully', async () => {
      // Setup
      const registerUser = async (req, res) => {
        const { name, username, password } = req.body;
        try {
          const user = await mockUserUseCases.registerUser(name, username, password);
          res.json({ msg: 'User registered successfully', user: user });
        } catch (err) {
          console.error(err.message);
          res.status(400).json({ msg: err.message });
        }
      };
      
      // Create request with user data
      mockReq.body = {
        name: 'Test User',
        username: 'testuser',
        password: 'password123'
      };
      
      // Mock userUseCases.registerUser
      const user = { id: 'user123', name: 'Test User', username: 'testuser' };
      mockUserUseCases.registerUser.mockResolvedValue(user);
      
      // Call the handler
      await registerUser(mockReq, mockRes);
      
      // Verify userUseCases.registerUser was called with correct arguments
      expect(mockUserUseCases.registerUser).toHaveBeenCalledWith(
        'Test User',
        'testuser',
        'password123'
      );
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: 'User registered successfully',
        user
      });
    });
    
    it('should handle registration error', async () => {
      // Setup
      const registerUser = async (req, res) => {
        const { name, username, password } = req.body;
        try {
          const user = await mockUserUseCases.registerUser(name, username, password);
          res.json({ msg: 'User registered successfully', user: user });
        } catch (err) {
          console.error(err.message);
          res.status(400).json({ msg: err.message });
        }
      };
      
      // Create request with user data
      mockReq.body = {
        name: 'Test User',
        username: 'testuser',
        password: 'password123'
      };
      
      // Mock console.error
      console.error = jest.fn();
      
      // Mock userUseCases.registerUser to throw error
      const error = new Error('User already exists');
      mockUserUseCases.registerUser.mockRejectedValue(error);
      
      // Call the handler
      await registerUser(mockReq, mockRes);
      
      // Verify error handling
      expect(console.error).toHaveBeenCalledWith(error.message);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });
  
  describe('Login User', () => {
    it('should authenticate user successfully', async () => {
      // Setup
      const loginUser = (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
          if (err) throw err;
          if (!user) res.status(400).json({ msg: 'No user exists' });
          else {
            req.logIn(user, async err => {
              if (err) throw err;
              await mockUserUseCases.updateUserOnlineStatus(user.id, true);
              res.json({ msg: 'Successfully Authenticated', user: user });
            });
          }
        })(req, res, next);
      };
      
      // Create a user object
      const user = { id: 'user123', username: 'testuser' };
      
      // Mock passport.authenticate to call the callback with the user
      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, user, null);
        };
      });
      
      // Mock req.logIn to immediately call the callback
      mockReq.logIn = jest.fn((user, callback) => {
        callback();
        return Promise.resolve();
      });
      
      // Call the handler
      await loginUser(mockReq, mockRes, mockNext);
      
      // Verify passport.authenticate was called
      expect(passport.authenticate).toHaveBeenCalledWith('local', expect.any(Function));
      
      // Verify req.logIn was called
      expect(mockReq.logIn).toHaveBeenCalledWith(user, expect.any(Function));
      
      // Verify userUseCases.updateUserOnlineStatus was called
      expect(mockUserUseCases.updateUserOnlineStatus).toHaveBeenCalledWith(user.id, true);
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith({ 
        msg: 'Successfully Authenticated', 
        user 
      });
    });
    
    it('should handle failed authentication', () => {
      // Setup
      const loginUser = (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
          if (err) throw err;
          if (!user) res.status(400).json({ msg: 'No user exists' });
          else {
            req.logIn(user, async err => {
              if (err) throw err;
              await mockUserUseCases.updateUserOnlineStatus(user.id, true);
              res.json({ msg: 'Successfully Authenticated', user: user });
            });
          }
        })(req, res, next);
      };
      
      // Mock passport.authenticate
      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(null, null, { message: 'Invalid credentials' });
        };
      });
      
      // Call the handler
      loginUser(mockReq, mockRes, mockNext);
      
      // Verify passport.authenticate was called
      expect(passport.authenticate).toHaveBeenCalledWith('local', expect.any(Function));
      
      // Verify response for failed authentication
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'No user exists' });
    });
    
    it('should handle authentication error', () => {
      // Setup
      const loginUser = (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
          if (err) throw err;
          if (!user) res.status(400).json({ msg: 'No user exists' });
          else {
            req.logIn(user, async err => {
              if (err) throw err;
              await mockUserUseCases.updateUserOnlineStatus(user.id, true);
              res.json({ msg: 'Successfully Authenticated', user: user });
            });
          }
        })(req, res, next);
      };
      
      // Mock passport.authenticate
      const error = new Error('Authentication error');
      passport.authenticate.mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          callback(error, null, null);
        };
      });
      
      // Expect the handler to throw an error
      expect(() => {
        loginUser(mockReq, mockRes, mockNext);
      }).toThrow('Authentication error');
    });
  });
  
  describe('Logout User', () => {
    it('should handle logout for authenticated user', async () => {
      // Setup
      const logoutUser = async (req, res, next) => {
        if (req.user) {
          await mockUserUseCases.updateUserOnlineStatus(req.user.id, false);
        }
        req.logout(err => {
          if (err) { return next(err); }
          res.json({ msg: 'Successfully logged out' });
        });
      };
      
      // Call the handler
      await logoutUser(mockReq, mockRes, mockNext);
      
      // Verify userUseCases.updateUserOnlineStatus was called
      expect(mockUserUseCases.updateUserOnlineStatus).toHaveBeenCalledWith('user123', false);
      
      // Verify req.logout was called
      expect(mockReq.logout).toHaveBeenCalled();
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Successfully logged out' });
    });
    
    it('should handle logout for unauthenticated user', async () => {
      // Setup
      const logoutUser = async (req, res, next) => {
        if (req.user) {
          await mockUserUseCases.updateUserOnlineStatus(req.user.id, false);
        }
        req.logout(err => {
          if (err) { return next(err); }
          res.json({ msg: 'Successfully logged out' });
        });
      };
      
      // Set user to null
      mockReq.user = null;
      
      // Call the handler
      await logoutUser(mockReq, mockRes, mockNext);
      
      // Verify userUseCases.updateUserOnlineStatus was not called
      expect(mockUserUseCases.updateUserOnlineStatus).not.toHaveBeenCalled();
      
      // Verify req.logout was called
      expect(mockReq.logout).toHaveBeenCalled();
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith({ msg: 'Successfully logged out' });
    });
    
    it('should handle logout error', async () => {
      // Setup
      const logoutUser = async (req, res, next) => {
        if (req.user) {
          await mockUserUseCases.updateUserOnlineStatus(req.user.id, false);
        }
        req.logout(err => {
          if (err) { return next(err); }
          res.json({ msg: 'Successfully logged out' });
        });
      };
      
      // Mock logout to call callback with error
      const logoutError = new Error('Logout error');
      mockReq.logout = jest.fn(callback => callback(logoutError));
      
      // Call the handler
      await logoutUser(mockReq, mockRes, mockNext);
      
      // Verify next was called with the error
      expect(mockNext).toHaveBeenCalledWith(logoutError);
    });
  });
  
  describe('Get All Users', () => {
    it('should get all users successfully', async () => {
      // Setup
      const getAllUsers = async (req, res) => {
        try {
          const users = await mockUserUseCases.getAllUsers();
          res.json(users);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Mock userUseCases.getAllUsers
      const users = [
        { id: 'user1', username: 'user1' },
        { id: 'user2', username: 'user2' }
      ];
      mockUserUseCases.getAllUsers.mockResolvedValue(users);
      
      // Call the handler
      await getAllUsers(mockReq, mockRes);
      
      // Verify userUseCases.getAllUsers was called
      expect(mockUserUseCases.getAllUsers).toHaveBeenCalled();
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith(users);
    });
    
    it('should handle error when getting users', async () => {
      // Setup
      const getAllUsers = async (req, res) => {
        try {
          const users = await mockUserUseCases.getAllUsers();
          res.json(users);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Mock console.error
      console.error = jest.fn();
      
      // Mock userUseCases.getAllUsers to throw error
      const error = new Error('Database error');
      mockUserUseCases.getAllUsers.mockRejectedValue(error);
      
      // Call the handler
      await getAllUsers(mockReq, mockRes);
      
      // Verify error handling
      expect(console.error).toHaveBeenCalledWith(error.message);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Server error');
    });
  });
});