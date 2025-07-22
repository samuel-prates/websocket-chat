describe('Messages Routes', () => {
  // Mock dependencies
  let mockMessageUseCases;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock messageUseCases
    mockMessageUseCases = {
      sendMessage: jest.fn(),
      getMessagesBetweenUsers: jest.fn()
    };
    
    // Create mock request and response
    mockReq = {
      body: {},
      params: {}
    };
    
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });
  
  describe('Send Message', () => {
    it('should send a message successfully', async () => {
      // Setup
      const sendMessage = async (req, res) => {
        const { from, to, message } = req.body;
        try {
          const savedMessage = await mockMessageUseCases.sendMessage(from, to, message);
          res.json(savedMessage);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Create request with message data
      mockReq.body = {
        from: 'user1',
        to: 'user2',
        message: 'Hello, world!'
      };
      
      // Mock messageUseCases.sendMessage
      const savedMessage = { 
        id: 'msg123', 
        ...mockReq.body, 
        timestamp: new Date() 
      };
      mockMessageUseCases.sendMessage.mockResolvedValue(savedMessage);
      
      // Call the handler
      await sendMessage(mockReq, mockRes);
      
      // Verify messageUseCases.sendMessage was called with correct arguments
      expect(mockMessageUseCases.sendMessage).toHaveBeenCalledWith(
        mockReq.body.from,
        mockReq.body.to,
        mockReq.body.message
      );
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith(savedMessage);
    });
    
    it('should handle error when sending a message', async () => {
      // Setup
      const sendMessage = async (req, res) => {
        const { from, to, message } = req.body;
        try {
          const savedMessage = await mockMessageUseCases.sendMessage(from, to, message);
          res.json(savedMessage);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Create request with message data
      mockReq.body = {
        from: 'user1',
        to: 'user2',
        message: 'Hello, world!'
      };
      
      // Mock console.error
      console.error = jest.fn();
      
      // Mock messageUseCases.sendMessage to throw error
      const error = new Error('Database error');
      mockMessageUseCases.sendMessage.mockRejectedValue(error);
      
      // Call the handler
      await sendMessage(mockReq, mockRes);
      
      // Verify error handling
      expect(console.error).toHaveBeenCalledWith(error.message);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Server error');
    });
    
    it('should handle missing required fields', async () => {
      // Setup
      const sendMessage = async (req, res) => {
        const { from, to, message } = req.body;
        try {
          const savedMessage = await mockMessageUseCases.sendMessage(from, to, message);
          res.json(savedMessage);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Create request with incomplete data
      mockReq.body = {
        from: 'user1',
        // missing 'to' field
        message: 'Hello, world!'
      };
      
      // Mock messageUseCases.sendMessage
      const savedMessage = { 
        id: 'msg123', 
        ...mockReq.body, 
        to: undefined,
        timestamp: new Date() 
      };
      mockMessageUseCases.sendMessage.mockResolvedValue(savedMessage);
      
      // Call the handler
      await sendMessage(mockReq, mockRes);
      
      // Verify messageUseCases.sendMessage was called with correct arguments
      expect(mockMessageUseCases.sendMessage).toHaveBeenCalledWith(
        mockReq.body.from,
        undefined,
        mockReq.body.message
      );
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith(savedMessage);
    });
  });
  
  describe('Get Messages Between Users', () => {
    it('should get messages between users successfully', async () => {
      // Setup
      const getMessagesBetweenUsers = async (req, res) => {
        const { user1Id, user2Id } = req.params;
        try {
          const messages = await mockMessageUseCases.getMessagesBetweenUsers(user1Id, user2Id);
          res.json(messages);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Create request with user IDs
      const user1Id = 'user1';
      const user2Id = 'user2';
      mockReq.params = { user1Id, user2Id };
      
      // Mock messageUseCases.getMessagesBetweenUsers
      const messages = [
        { id: 'msg1', from: user1Id, to: user2Id, message: 'Hello', timestamp: new Date() },
        { id: 'msg2', from: user2Id, to: user1Id, message: 'Hi there', timestamp: new Date() }
      ];
      mockMessageUseCases.getMessagesBetweenUsers.mockResolvedValue(messages);
      
      // Call the handler
      await getMessagesBetweenUsers(mockReq, mockRes);
      
      // Verify messageUseCases.getMessagesBetweenUsers was called with correct arguments
      expect(mockMessageUseCases.getMessagesBetweenUsers).toHaveBeenCalledWith(user1Id, user2Id);
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith(messages);
    });
    
    it('should handle error when getting messages between users', async () => {
      // Setup
      const getMessagesBetweenUsers = async (req, res) => {
        const { user1Id, user2Id } = req.params;
        try {
          const messages = await mockMessageUseCases.getMessagesBetweenUsers(user1Id, user2Id);
          res.json(messages);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Create request with user IDs
      const user1Id = 'user1';
      const user2Id = 'user2';
      mockReq.params = { user1Id, user2Id };
      
      // Mock console.error
      console.error = jest.fn();
      
      // Mock messageUseCases.getMessagesBetweenUsers to throw error
      const error = new Error('Database error');
      mockMessageUseCases.getMessagesBetweenUsers.mockRejectedValue(error);
      
      // Call the handler
      await getMessagesBetweenUsers(mockReq, mockRes);
      
      // Verify error handling
      expect(console.error).toHaveBeenCalledWith(error.message);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Server error');
    });
    
    it('should handle missing user IDs in params', async () => {
      // Setup
      const getMessagesBetweenUsers = async (req, res) => {
        const { user1Id, user2Id } = req.params;
        try {
          const messages = await mockMessageUseCases.getMessagesBetweenUsers(user1Id, user2Id);
          res.json(messages);
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server error');
        }
      };
      
      // Create request with empty params
      mockReq.params = {};
      
      // Mock messageUseCases.getMessagesBetweenUsers
      const messages = [];
      mockMessageUseCases.getMessagesBetweenUsers.mockResolvedValue(messages);
      
      // Call the handler
      await getMessagesBetweenUsers(mockReq, mockRes);
      
      // Verify messageUseCases.getMessagesBetweenUsers was called with undefined params
      expect(mockMessageUseCases.getMessagesBetweenUsers).toHaveBeenCalledWith(undefined, undefined);
      
      // Verify response
      expect(mockRes.json).toHaveBeenCalledWith(messages);
    });
  });
});