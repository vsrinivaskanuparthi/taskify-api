const request = require('supertest');
const express = require('express');
const taskRoutes = require('../routes/taskRoutes');

jest.mock('../models/taskModel');

const Task = require('../models/taskModel');

const app = express();
app.use(express.json());
app.use('/tasks', taskRoutes);

describe('Task API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new task', async () => {
        const mockTaskData = {
            _id: 'mockId123',
            title: 'Mock Task',
            description: 'Test desc',
            priority: 'High',
            status: 'Pending',
        };

        const mockSave = jest.fn().mockResolvedValue(mockTaskData);

        // Simulate Mongoose model constructor returning an object with a save method
        Task.mockImplementation(() => ({
            ...mockTaskData,
            save: mockSave,
        }));

        const res = await request(app).post('/tasks').send({
            title: 'Mock Task',
            description: 'Test desc',
            priority: 'High',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Mock Task'); // ✅ should pass now
    });

    it('should return all tasks', async () => {
        const mockTasks = [
            { title: 'Task 1' },
            { title: 'Task 2' },
        ];

        Task.find.mockResolvedValue(mockTasks);

        const res = await request(app).get('/tasks');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    it('should update a task', async () => {
        const mockUpdatedTask = { _id: '123', status: 'Completed' };
        Task.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedTask);

        const res = await request(app).put('/tasks/123').send({ status: 'Completed' });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('Completed');
    });

    it('should delete a task', async () => {
        Task.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: '123' });

        const res = await request(app).delete('/tasks/123');
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Task deleted successfully');
    });
});
