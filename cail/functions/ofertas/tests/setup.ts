// Test setup file - se ejecuta DESPUÉS de cargar módulos
// Mocks y configuración de Jest

// Aumentar timeout para tests
jest.setTimeout(30000);

// Silenciar console durante tests
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

// Mock de Firebase Admin
jest.mock('firebase-admin', () => {
    const mockFirestore = {
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ exists: false, data: () => null })),
                set: jest.fn(() => Promise.resolve()),
                update: jest.fn(() => Promise.resolve()),
                delete: jest.fn(() => Promise.resolve()),
            })),
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
                limit: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
                })),
                orderBy: jest.fn(() => ({
                    limit: jest.fn(() => ({
                        get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
                    })),
                    get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
                })),
            })),
            orderBy: jest.fn(() => ({
                limit: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
                })),
                get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
            })),
            add: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
            get: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
        })),
    };

    return {
        apps: [],
        initializeApp: jest.fn(),
        credential: {
            cert: jest.fn(() => ({})),
        },
        firestore: jest.fn(() => mockFirestore),
        auth: jest.fn(() => ({
            verifyIdToken: jest.fn(),
            createUser: jest.fn(),
        })),
    };
});
