// tests/api.test.js
const request = require('supertest');
const createServer = require('../src/server');
const db = require('../src/db/memory'); // Needed to reset the store

const app = createServer();

// Reset the in-memory store before each test
beforeEach(() => {
    db.__reset();
});

describe('Service Health Checks', () => {
    // health check test
    it('GET /healthz should return status ok and a commit sha', async () => {
        const response = await request(app).get('/healthz');
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body).toHaveProperty('commit');
    });
});

describe('Todo API Tests', () => {
    // happy path create
    it('POST /api/v1/todos should create a new todo item', async () => {
        const todoData = { title: 'Test Todo Item' };
        const response = await request(app)
            .post('/api/v1/todos')
            .send(todoData)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(todoData.title);
        expect(response.body.done).toBe(false); // Default should be false
    });

    // happy path list
    it('GET /api/v1/todos should return a list of todos', async () => {
        // Create an item first
        await request(app)
            .post('/api/v1/todos')
            .send({ title: 'Item 1' });

        const response = await request(app)
            .get('/api/v1/todos')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].title).toBe('Item 1');
    });

    // one negative case (e.g., validation)
    it('POST /api/v1/todos should return 400 if title is missing', async () => {
        const todoData = { title: '' }; // Empty string is a negative case
        const response = await request(app)
            .post('/api/v1/todos')
            .send(todoData)
            .expect('Content-Type', /json/)
            .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Title is required');
    });

    // The line where the error was reported:
    it('POST /api/v1/todos should return 400 if no title is sent', async () => {
        // Changed 'response' to '_response' to fix the 'no-unused-vars' error
        const _response = await request(app)
            .post('/api/v1/todos')
            .send({})
            .expect(400);
    });
});
