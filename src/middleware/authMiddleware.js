const jwt = require('jsonwebtoken')

module.exports = function(req, res, next){

    // obtains authorization header
    const authHeader = req.header('Authorization')
    if (!authHeader) {
        return res.status(401).json({message: 'Denied access: no token provided'})
    }

    // extract token from header
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length) : authHeader;


    try{
        // Verify the token
        const verify = jwt.verify(token, process.env.JWT_SECRET)
        // Add the user to the request object
        req.user = verify
        next()
    } catch (err) {
        return res.status(401).json({message: 'Denied access: Invalid token'})
    }

}