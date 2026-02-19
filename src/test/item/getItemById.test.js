require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')
const Item = require('../../models/Item')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
let createdUserIds = []
let createdItemIds = []

const createUser = async () => {
    const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        username: `item_${baseId}_${Math.random().toString(36).slice(2, 8)}`,
        email: `item_${baseId}_${Math.random().toString(36).slice(2, 8)}@example.com`,
        phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password: 'Password123!'
    })
    createdUserIds.push(user._id)
    return user
}

const createItem = async (userId, overrides = {}) => {
    const item = await Item.create({
        title: `Oggetto ${Math.random().toString(36).slice(2, 8)}`,
        description: 'Descrizione di test per oggetto',
        userId,
        category: 'test',
        location: { city: 'Trento', address: 'Via Roma 1' },
        ...overrides
    })
    createdItemIds.push(item._id)
    return item
}

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL)
})

afterEach(async () => {
    if (createdItemIds.length) {
        await Item.deleteMany({ _id: { $in: createdItemIds } })
        createdItemIds = []
    }
    if (createdUserIds.length) {
        await User.deleteMany({ _id: { $in: createdUserIds } })
        createdUserIds = []
    }
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('Item API', () => {
    describe('GET /api/item/:id', () => {
        test('deve restituire un oggetto per id', async () => {
            const user = await createUser()
            const item = await createItem(user._id)
            const response = await request(app).get(`/api/item/${item._id}`)
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('_id')
        })

        test('deve restituire errore per id non valido', async () => {
            const response = await request(app).get('/api/item/000000000000000000000000')
            expect(response.status).toBe(404)
            expect(response.body.message).toBe('Item not found')
        })
    })
})
