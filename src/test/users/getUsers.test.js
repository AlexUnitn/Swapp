require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')
const { generateCF } = require('../../utils/validation')
const { createToken } = require('../../utils/authUtils')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
let createdUserIds = []

const createUser = async (overrides = {}) => {
    const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        username: `user_${baseId}_${Math.random().toString(36).slice(2, 8)}`,
        email: `user_${baseId}_${Math.random().toString(36).slice(2, 8)}@example.com`,
        phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        fiscalCode: generateCF(),
        password: 'Password123!',
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

describe('Users API', () => {
    describe('GET /api/users', () => {
        test('deve restituire la lista utenti senza password', async () => {
            const user = await createUser()
            await createUser()
            const token = createToken(user)
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            if (response.body.length > 0) {
                const first = response.body[0]
                expect(first).not.toHaveProperty('password')
            }
        })
    })
})
