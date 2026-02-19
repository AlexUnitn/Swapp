require('dotenv').config()
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../../app')
const User = require('../../models/User')
const Report = require('../../models/Report')

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
        password: 'Password123!'
    })
    createdUserIds.push(user._id)
    return user
}

const createReport = async (reporter, overrides = {}) => {
    const report = await Report.create({
        reporter,
        type: 'other',
        description: 'Segnalazione di test',
        ...overrides
    })
    createdReportIds.push(report._id)
    return report
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
    describe('GET /api/report', () => {
        test('deve restituire la lista report', async () => {
            const user = await createUser()
            await createReport(user._id)
            const response = await request(app).get('/api/report')
            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })
    })
})
