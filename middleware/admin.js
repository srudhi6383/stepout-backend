const jwt = require('jsonwebtoken');

const AdminMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'stepout');
        if (!decoded.admin) { // Assuming your JWT payload includes an 'admin' field
            return res.status(403).json({ error: 'Access denied. You are not an admin.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: 'Invalid token.' });
    }
};

module.exports = AdminMiddleware;
