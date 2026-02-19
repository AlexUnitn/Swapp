require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')
const Item = require('../../models/Item')
const Booking = require('../../models/Booking')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
let createdUserIds = []
let createdItemIds = []
let createdBookingIds = []

const createUser = async () => {
    const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        username: `booking_${baseId}_${Math.random().toString(36).slice(2, 8)}`,
        email: `booking_${baseId}_${Math.random().toString(36).slice(2, 8)}@example.com`,
        phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        password: 'Password123!'
    })
    createdUserIds.push(user._id)
    return user
}

const createItem = async (userId) => {
    const item = await Item.create({
        title: `Oggetto ${Math.random().toString(36).slice(2, 8)}`,
        description: 'Descrizione di test per oggetto',
        userId,
        category: 'test',
        location: { city: 'Trento', address: 'Via Roma 1' }
    })
    createdItemIds.push(item._id)
    return item
}

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL)
})

afterEach(async () => {
    if (createdBookingIds.length) {
        await Booking.deleteMany({ _id: { $in: createdBookingIds } })
        createdBookingIds = []
    }
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

describe('Booking API', () => {
    describe('POST /api/booking', () => {
        test('deve creare un booking', async () => {
            const owner = await createUser()
            const borrower = await createUser()
            const item = await createItem(owner._id)
            const response = await request(app)
                .post('/api/booking')
                .send({
                    item: item._id,
                    borrower: borrower._id,
                    requestedStartDate: new Date(),
                    requestedEndDate: new Date(Date.now() + 86400000)
                })
            if (response.status === 201 && response.body && response.body._id) {
                createdBookingIds.push(response.body._id)
            }
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('_id')
        })
    })
})
