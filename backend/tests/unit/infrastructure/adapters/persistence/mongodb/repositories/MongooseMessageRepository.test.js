const MessageDomain = require('../../../../../../../src/application/domain/Message');
const MessageModel = require('../../../../../../../src/infrastructure/adapters/persistence/mongodb/models/Message');
const MongooseMessageRepository = require('../../../../../../../src/infrastructure/adapters/persistence/mongodb/repositories/MongooseMessageRepository');

// Mock MessageModel
jest.mock('../../../../../../../src/infrastructure/adapters/persistence/mongodb/models/Message');

describe('MongooseMessageRepository', () => {
  let messageRepository;
  let mockMessageData;
  let mockMessageModel;
  let mockMessageDomain;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create repository instance
    messageRepository = new MongooseMessageRepository();

    // Create mock message data
    mockMessageData = {
      _id: 'msg123',
      from: 'user1',
      to: 'user2',
      message: 'Hello, world!',
      timestamp: new Date('2025-07-22T11:15:00Z')
    };

    // Create mock message model
    mockMessageModel = {
      ...mockMessageData,
      save: jest.fn().mockResolvedValue(mockMessageData)
    };

    // Create mock message domain
    mockMessageDomain = new MessageDomain(
      mockMessageData._id,
      mockMessageData.from,
      mockMessageData.to,
      mockMessageData.message,
      mockMessageData.timestamp
    );

    // Mock MessageModel methods
    MessageModel.find = jest.fn();
    MessageModel.mockImplementation(() => mockMessageModel);
  });

  describe('save', () => {
    it('should save a message and return domain model', async () => {
      // Arrange
      const messageDomain = new MessageDomain(
        null,
        'user1',
        'user2',
        'Hello, world!',
        new Date('2025-07-22T11:15:00Z')
      );

      const savedMessageData = {
        _id: 'msg123',
        from: 'user1',
        to: 'user2',
        message: 'Hello, world!',
        timestamp: new Date('2025-07-22T11:15:00Z')
      };

      mockMessageModel.save.mockResolvedValue(savedMessageData);

      // Act
      const result = await messageRepository.save(messageDomain);

      // Assert
      expect(MessageModel).toHaveBeenCalledWith({
        from: 'user1',
        to: 'user2',
        message: 'Hello, world!',
        timestamp: expect.any(Date)
      });
      expect(mockMessageModel.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(MessageDomain);
      expect(result.id).toBe(savedMessageData._id);
      expect(result.from).toBe(savedMessageData.from);
      expect(result.to).toBe(savedMessageData.to);
      expect(result.message).toBe(savedMessageData.message);
      expect(result.timestamp).toEqual(savedMessageData.timestamp);
    });

    it('should handle save error', async () => {
      // Arrange
      const messageDomain = new MessageDomain(
        null,
        'user1',
        'user2',
        'Hello, world!',
        new Date('2025-07-22T11:15:00Z')
      );

      const error = new Error('Database error');
      mockMessageModel.save.mockRejectedValue(error);

      // Act & Assert
      await expect(messageRepository.save(messageDomain)).rejects.toThrow('Database error');
      expect(MessageModel).toHaveBeenCalled();
      expect(mockMessageModel.save).toHaveBeenCalled();
    });
  });

  describe('findMessagesBetweenUsers', () => {
    it('should find messages between users and return domain models', async () => {
      // Arrange
      const user1Id = 'user1';
      const user2Id = 'user2';
      
      const messagesData = [
        mockMessageData,
        {
          _id: 'msg456',
          from: 'user2',
          to: 'user1',
          message: 'Hi there!',
          timestamp: new Date('2025-07-22T11:20:00Z')
        }
      ];

      MessageModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(messagesData)
      });

      // Act
      const result = await messageRepository.findMessagesBetweenUsers(user1Id, user2Id);

      // Assert
      expect(MessageModel.find).toHaveBeenCalledWith({
        $or: [
          { from: user1Id, to: user2Id },
          { from: user2Id, to: user1Id }
        ]
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(MessageDomain);
      expect(result[0].id).toBe('msg123');
      expect(result[0].from).toBe('user1');
      expect(result[0].to).toBe('user2');
      expect(result[1]).toBeInstanceOf(MessageDomain);
      expect(result[1].id).toBe('msg456');
      expect(result[1].from).toBe('user2');
      expect(result[1].to).toBe('user1');
    });

    it('should return empty array if no messages found', async () => {
      // Arrange
      const user1Id = 'user1';
      const user2Id = 'user2';
      
      MessageModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await messageRepository.findMessagesBetweenUsers(user1Id, user2Id);

      // Assert
      expect(MessageModel.find).toHaveBeenCalledWith({
        $or: [
          { from: user1Id, to: user2Id },
          { from: user2Id, to: user1Id }
        ]
      });
      expect(result).toHaveLength(0);
    });

    it('should handle find error', async () => {
      // Arrange
      const user1Id = 'user1';
      const user2Id = 'user2';
      
      const error = new Error('Database error');
      MessageModel.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(error)
      });

      // Act & Assert
      await expect(messageRepository.findMessagesBetweenUsers(user1Id, user2Id)).rejects.toThrow('Database error');
      expect(MessageModel.find).toHaveBeenCalled();
    });
  });
});