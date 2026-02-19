require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
let createdUserIds = []

const createUser = async (overrides = {}) => {
    const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        username: `user_${baseId}_${Math.random().toString(36).slice(2, 8)}`,
        email: `user_${baseId}_${Math.random().toString(36).slice(2, 8)}@example.com`,
        phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
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
    describe('PUT /api/users/:id', () => {
        test('deve aggiornare un utente', async () => {
            const user = await createUser()
            const response = await request(app)
                .put(`/api/users/${user._id}`)
                .send({ lastName: 'Updated' })
            expect(response.status).toBe(200)
            expect(response.body.message).toBe('User updated')
        })

        test('deve restituire errore per id non valido', async () => {
            const response = await request(app)
                .put('/api/users/000000000000000000000000')
                .send({ lastName: 'Updated' })
            expect(response.status).toBe(404)
            expect(response.body.message).toBe('User not found')
        })
    })
})
