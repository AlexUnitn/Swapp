require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
const baseEmail = `test_${baseId}@example.com`
const basePhone = `${Math.floor(1000000000 + Math.random() * 9000000000)}`
const basePassword = 'Password123!'

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL)
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('Auth API',()=> {
    describe('POST /api/auth/register',()=>{
        test('deve registrare un nuovo utente con successo',async ()=>{
            const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName:'test',
                lastName:'user', 
                phoneNumber: basePhone,
                username:`testuser_${baseId}`,
                email: baseEmail,
                password: basePassword
            })
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
        })
        test('deve restituire un errore se l\'email è già registrata',async ()=>{
            const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName:'test',
                lastName:'user', 
                phoneNumber:`${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                username:`testuser_${baseId}_2`,
                email: baseEmail,
                password: basePassword
            })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email, username or phone number already registered');
        })
        test('deve restituire un errore se il numero di telefono è già registrato',async ()=>{
            const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName:'test',
                lastName:'user', 
                phoneNumber: basePhone,
                username:`testuser_${baseId}_3`,
                email:`test_${baseId}_2@example.com`,
                password: basePassword
            })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email, username or phone number already registered');
        })
    })
})
