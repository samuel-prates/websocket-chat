const UserDomain = require('../../../../../../../src/application/domain/User');
const UserModel = require('../../../../../../../src/infrastructure/adapters/persistence/mongodb/models/User');
const MongooseUserRepository = require('../../../../../../../src/infrastructure/adapters/persistence/mongodb/repositories/MongooseUserRepository');

// Mock UserModel
jest.mock('../../../../../../../src/infrastructure/adapters/persistence/mongodb/models/User');

describe('MongooseUserRepository', () => {
  let userRepository;
  let mockUserData;
  let mockUserModel;
  let mockUserDomain;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create repository instance
    userRepository = new MongooseUserRepository();

    // Create mock user data
    mockUserData = {
      _id: 'user123',
      name: 'Test User',
      username: 'testuser',
      password: 'hashedpassword',
      online: false
    };

    // Create mock user model
    mockUserModel = {
      ...mockUserData,
      save: jest.fn().mockResolvedValue(mockUserData)
    };

    // Create mock user domain
    mockUserDomain = new UserDomain(
      mockUserData._id,
      mockUserData.name,
      mockUserData.username,
      mockUserData.password,
      mockUserData.online
    );

    // Mock UserModel methods
    UserModel.findOne = jest.fn();
    UserModel.findById = jest.fn();
    UserModel.findByIdAndUpdate = jest.fn();
    UserModel.find = jest.fn();
    UserModel.mockImplementation(() => mockUserModel);
  });

  describe('findByUsername', () => {
    it('should find a user by username and return domain model', async () => {
      // Arrange
      UserModel.findOne.mockResolvedValue(mockUserData);

      // Act
      const result = await userRepository.findByUsername('testuser');

      // Assert
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(result).toBeInstanceOf(UserDomain);
      expect(result.id).toBe(mockUserData._id);
      expect(result.name).toBe(mockUserData.name);
      expect(result.username).toBe(mockUserData.username);
      expect(result.password).toBe(mockUserData.password);
      expect(result.online).toBe(mockUserData.online);
    });

    it('should return null if user not found', async () => {
      // Arrange
      UserModel.findOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findByUsername('nonexistentuser');

      // Assert
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: 'nonexistentuser' });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id and return domain model', async () => {
      // Arrange
      UserModel.findById.mockResolvedValue(mockUserData);

      // Act
      const result = await userRepository.findById('user123');

      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith('user123');
      expect(result).toBeInstanceOf(UserDomain);
      expect(result.id).toBe(mockUserData._id);
    });

    it('should return null if user not found', async () => {
      // Arrange
      UserModel.findById.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById('nonexistentid');

      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith('nonexistentid');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should create a new user if no id provided', async () => {
      // Arrange
      const newUserDomain = new UserDomain(
        null,
        'New User',
        'newuser',
        'password123',
        false
      );

      const savedUserData = {
        _id: 'newuser123',
        name: 'New User',
        username: 'newuser',
        password: 'password123',
        online: false
      };

      mockUserModel.save.mockResolvedValue(savedUserData);

      // Act
      const result = await userRepository.save(newUserDomain);

      // Assert
      expect(UserModel).toHaveBeenCalledWith({
        name: 'New User',
        username: 'newuser',
        password: 'password123',
        online: false
      });
      expect(mockUserModel.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(UserDomain);
      expect(result.id).toBe(savedUserData._id);
    });

    it('should update an existing user if id provided', async () => {
      // Arrange
      const existingUserDomain = new UserDomain(
        'user123',
        'Updated User',
        'testuser',
        'newpassword',
        true
      );

      const updatedUserData = {
        _id: 'user123',
        name: 'Updated User',
        username: 'testuser',
        password: 'newpassword',
        online: true
      };

      UserModel.findById.mockResolvedValue(mockUserModel);
      mockUserModel.save.mockResolvedValue(updatedUserData);

      // Act
      const result = await userRepository.save(existingUserDomain);

      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith('user123');
      expect(mockUserModel.name).toBe('Updated User');
      expect(mockUserModel.password).toBe('newpassword');
      expect(mockUserModel.online).toBe(true);
      expect(mockUserModel.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(UserDomain);
      expect(result.name).toBe('Updated User');
    });

    it('should throw an error if user to update not found', async () => {
      // Arrange
      const existingUserDomain = new UserDomain(
        'nonexistentid',
        'Updated User',
        'testuser',
        'newpassword',
        true
      );

      UserModel.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userRepository.save(existingUserDomain)).rejects.toThrow('User not found');
      expect(UserModel.findById).toHaveBeenCalledWith('nonexistentid');
    });
  });

  describe('updateOnlineStatus', () => {
    it('should update user online status', async () => {
      // Arrange
      const updatedUserData = {
        ...mockUserData,
        online: true
      };

      UserModel.findByIdAndUpdate.mockResolvedValue(updatedUserData);

      // Act
      const result = await userRepository.updateOnlineStatus('user123', true);

      // Assert
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { online: true },
        { new: true }
      );
      expect(result).toBeInstanceOf(UserDomain);
      expect(result.online).toBe(true);
    });

    it('should return null if user not found', async () => {
      // Arrange
      UserModel.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      const result = await userRepository.updateOnlineStatus('nonexistentid', true);

      // Assert
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonexistentid',
        { online: true },
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users as domain models', async () => {
      // Arrange
      const usersData = [
        mockUserData,
        {
          _id: 'user456',
          name: 'Another User',
          username: 'anotheruser',
          password: 'hashedpassword2',
          online: true
        }
      ];

      UserModel.find.mockResolvedValue(usersData);

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(UserModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserDomain);
      expect(result[0].id).toBe('user123');
      expect(result[1]).toBeInstanceOf(UserDomain);
      expect(result[1].id).toBe('user456');
    });

    it('should return empty array if no users found', async () => {
      // Arrange
      UserModel.find.mockResolvedValue([]);

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(UserModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });
});