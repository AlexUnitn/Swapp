require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')
const Item = require('../../models/Item')
const Booking = require('../../models/Booking')
const { generateCF } = require('../../utils/validation')
const { createToken } = require('../../utils/authUtils')

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
        fiscalCode: generateCF(),
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

const createBooking = async (item, borrower) => {
    const booking = await Booking.create({
        item: item._id,
        borrower: borrower._id,
        requestedStartDate: new Date(),
        requestedEndDate: new Date(Date.now() + 86400000)
    })
    createdBookingIds.push(booking._id)
    return booking
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
    describe('DELETE /api/booking/:id', () => {
        test('deve eliminare un booking', async () => {
            const owner = await createUser()
            const borrower = await createUser()
            const token = createToken(borrower)
            const item = await createItem(owner._id)
            const booking = await createBooking(item, borrower)
            const response = await request(app).delete(`/api/booking/${booking._id}`)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(200)
            expect(response.body.message).toBe('Booking deleted')
        })

        test('deve restituire errore per id non valido', async () => {
            const user = await createUser()
            const token = createToken(user)
            const response = await request(app).delete('/api/booking/000000000000000000000000')
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(404)
            expect(response.body.message).toBe('Booking not found')
        })
    })
})
