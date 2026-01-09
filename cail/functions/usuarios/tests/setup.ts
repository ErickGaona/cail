// Test setup file - se ejecuta DESPUÉS de cargar módulos
// Mocks y configuración de Jest

// Aumentar timeout para tests de integración
jest.setTimeout(30000);

// Silenciar console.log durante tests (excepto warn para debugging)
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    // Mantener console.error para ver errores importantes
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
            })),
            add: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
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
