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
    describe('GET /api/report/:id', () => {
        test('deve restituire un report per id', async () => {
            const user = await createUser()
            const token = createToken(user)
            const report = await createReport(user._id)
            const response = await request(app).get(`/api/report/${report._id}`)
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('_id')
        })

        test('deve restituire errore per id non valido', async () => {
            const user = await createUser()
            const token = createToken(user)
            const response = await request(app).get('/api/report/000000000000000000000000')
                .set('Authorization', `Bearer ${token}`)
            expect(response.status).toBe(404)
        })
    })
})
