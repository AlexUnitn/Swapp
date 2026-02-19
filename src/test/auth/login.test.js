require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../../app')
const User = require('../../models/User')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
const basePassword = 'Password123!'
let createdUserIds = []

const createUser = async (overrides = {}) => {
    const password = await bcrypt.hash(basePassword, 10)
    const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        username: `login_${baseId}_${Math.random().toString(36).slice(2, 8)}`,
        email: `login_${baseId}_${Math.random().toString(36).slice(2, 8)}@example.com`,
        phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password,
        ...overrides
    })
    createdUserIds.push(user._id)
    return user
}

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL)
})

afterEach(async () => {
    if (createdUserIds.length) {
        await User.deleteMany({ _id: { $in: createdUserIds } })
        createdUserIds = []
    }
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('Auth API', () => {
    describe('POST /api/auth/login', () => {
        test('deve effettuare il login con email e password valide', async () => {
            const user = await createUser()
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: basePassword
                })
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('token')
        })

        test('deve restituire errore con password errata', async () => {
            const user = await createUser()
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: user.email,
                    password: 'Password1234!'
                })
            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Invalid credentials')
        })

        test('deve restituire errore senza credenziali', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})
            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Password is required')
        })
    })
})
