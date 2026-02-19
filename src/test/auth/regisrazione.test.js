require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
const baseEmail = `test_${baseId}@example.com`
const basePhone = `${Math.floor(1000000000 + Math.random() * 9000000000)}`
const basePassword = 'Password123!'
// Simple CF generator: 6 letters + 2 digits + 1 letter + 2 digits + 1 letter + 3 digits + 1 letter
const generateCF = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const rand = (str, len) => Array(len).fill(0).map(() => str[Math.floor(Math.random() * str.length)]).join('');
    return rand(letters, 6) + rand(digits, 2) + rand(letters, 1) + rand(digits, 2) + rand(letters, 1) + rand(digits, 3) + rand(letters, 1);
}
const baseCF = generateCF();

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL)
}, 10000)

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
                fiscalCode: baseCF,
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
                fiscalCode: generateCF(),
                password: basePassword
            })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email, username, phone number or fiscal code already registered');
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
                fiscalCode: generateCF(),
                password: basePassword
            })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email, username, phone number or fiscal code already registered');
        })
        test('deve restituire un errore se il codice fiscale è già registrato',async ()=>{
            const response = await request(app)
            .post('/api/auth/register')
            .send({
                firstName:'test',
                lastName:'user', 
                phoneNumber:`${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                username:`testuser_${baseId}_4`,
                email:`test_${baseId}_3@example.com`,
                fiscalCode: baseCF,
                password: basePassword
            })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email, username, phone number or fiscal code already registered');
        })
    })
})
