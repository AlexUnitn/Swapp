require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')
const Report = require('../../models/Report')
const { generateCF } = require('../../utils/validation')
const { createToken } = require('../../utils/authUtils')

const baseId = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
let createdUserIds = []
let createdReportIds = []

const createUser = async () => {
    const user = await User.create({
        firstName: 'Test',
        lastName: 'User',
        username: `report_${baseId}_${Math.random().toString(36).slice(2, 8)}`,
        email: `report_${baseId}_${Math.random().toString(36).slice(2, 8)}@example.com`,
        phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        fiscalCode: generateCF(),
        password: 'Password123!'
    })
    createdUserIds.push(user._id)
    return user
}

beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL)
})

afterEach(async () => {
    if (createdReportIds.length) {
        await Report.deleteMany({ _id: { $in: createdReportIds } })
        createdReportIds = []
    }
    if (createdUserIds.length) {
        await User.deleteMany({ _id: { $in: createdUserIds } })
        createdUserIds = []
    }
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('Report API', () => {
    describe('POST /api/report', () => {
        test('deve creare un report', async () => {
            const user = await createUser()
            const token = createToken(user)
            const response = await request(app)
                .post('/api/report')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    reporter: user._id,
                    type: 'other',
                    description: 'Segnalazione di test'
                })
            if (response.status === 200 && response.body && response.body._id) {
                createdReportIds.push(response.body._id)
            }
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('_id')
        })
    })
})
