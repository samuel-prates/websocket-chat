module.exports = {
    testEnvironment: 'node',
    rootDir: '../../',
    testMatch: [
        '<rootDir>/tests/integration/**/*.test.js'
    ],
    moduleFileExtensions: ['js', 'json', 'node'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: [
        'src/**/*.js',
    ],
};
