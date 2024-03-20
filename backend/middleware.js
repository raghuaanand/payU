const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

const authmiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: 'not authorized'
        });
    }

    const token = authHeader.split(' ')[1];


    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;

        next();
    } catch (err) {
        console.log(err);
        return res.status(403).json({
            message: 'error occured'
        });
    }
};

module.exports = {
    authmiddleware
}

