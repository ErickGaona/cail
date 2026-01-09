/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/index.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    testTimeout: 30000,
    // setupFiles: se ejecuta ANTES de importar módulos (variables de entorno)
    setupFiles: ['<rootDir>/tests/setup.env.ts'],
    // setupFilesAfterEnv: se ejecuta DESPUÉS (mocks, beforeAll, etc)
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
