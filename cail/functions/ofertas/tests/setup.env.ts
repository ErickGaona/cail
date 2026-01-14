// Variables de entorno para tests (ANTES de importar cualquier módulo)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBALRiMLAHpKh8JQKcVVvUMnEGEDRxz3aQfQIVCK0eOmGqpVGXHH3h\nPCkRZxTkMcQd8iQzVLEV7D7pn0qAQzUQvTECAwEAAQJAYPRHLLNSBx7y6yNBwLgD\ntest-key\n-----END RSA PRIVATE KEY-----\n';
process.env.PORT = '8083';

