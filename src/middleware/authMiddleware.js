const jwt = require('jsonwebtoken')

module.exports = function(req, res, next){

    // Find the token in the header
    const token = req.header('Authorization')
    
    if (!token) {
        return res.status(401).send('Denied access: no token provided')
    }

    try{
        // Verify the token
        const verify = jwt.verify(token, process.env.JWT_SECRET)
        // Add the user to the request object
        req.user = verify
        next()
    } catch (err) {
        return res.status(401).send('Denied access: token not valid')
    }

}