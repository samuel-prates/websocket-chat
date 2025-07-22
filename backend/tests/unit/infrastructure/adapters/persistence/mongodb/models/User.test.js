// Mock mongoose
jest.mock('mongoose', () => {
  // Create a mock schema constructor that returns a schema-like object
  function MockSchema(definition) {
    this.definition = definition;
    this.path = jest.fn();
    this.virtual = jest.fn().mockReturnThis();
    this.pre = jest.fn().mockReturnThis();
    this.post = jest.fn().mockReturnThis();
  }
  
  // Create a mock model that simulates mongoose model behavior
  const mockModelInstance = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(data => ({ _id: 'some-id', ...data })),
    save: jest.fn().mockResolvedValue({}),
  };
  
  // Mock model constructor
  function MockModel(name, schema) {
    this.modelName = name;
    this.schema = schema;
    return mockModelInstance;
  }
  
  return {
    Schema: MockSchema,
    model: jest.fn().mockImplementation((name, schema) => new MockModel(name, schema))
  };
});

// Now require the model - this will use the mocked mongoose
const User = require('../../../../../../../src/infrastructure/adapters/persistence/mongodb/models/User');

describe('User Model', () => {
  it('should export a mongoose model', () => {
    // Assert
    expect(User).toBeDefined();
    expect(typeof User).toBe('object');
    
    // Verify it has typical mongoose model methods
    expect(User.find).toBeDefined();
    expect(User.findOne).toBeDefined();
    expect(User.findById).toBeDefined();
  });
  
  it('should have the correct model name', () => {
    // We can't directly access modelName in the mock, but we can test the behavior
    // by checking that the model was created with the right name
    const mongoose = require('mongoose');
    expect(mongoose.model).toHaveBeenCalledWith('User', expect.any(Object));
  });
});