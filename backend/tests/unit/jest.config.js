
module.exports = {
    testEnvironment: 'node',
    rootDir: '../../',
    testMatch: [
        '<rootDir>/tests/unit/**/*.test.js'
    ],
    moduleFileExtensions: ['js', 'json', 'node'],
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: [
        'src/application/**/*.js',
        'src/infrastructure/**/*.js',
        '!src/infrastructure/adapters/http/routes/**/*.js',
    ],
    coverageThreshold: {
        global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
        }
    }
};
