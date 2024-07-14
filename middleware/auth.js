const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stepout');
        req.userId = decoded.userId; // Assuming your JWT payload includes userId
        next();
    } catch (ex) {
        console.error(ex);
        res.status(400).json({ error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
