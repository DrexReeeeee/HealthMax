const jwt = require('jsonwebtoken');
require('dotenv').config();

const optionalAuth = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        // Guest mode allowed
        return next();
    }

    try {
        const decoded = jwt.verify(
            token.split(" ")[1],
            process.env.JWT_SECRET
        );

        req.userId = decoded.id;
        req.isAdmin = decoded.is_admin || false;

    } catch (err) {
        console.log("Invalid token, continuing as guest");
    }

    next();
};

module.exports = optionalAuth;
