const jwt = require('jsonwebtoken')

const createToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    )
}

module.exports = { createToken }
