const express = require('express')
const jwt = require('jsonwebtoken');

function UserMiddleware(req, res, next) {
    const token = req.cookies.railway_token;
    if (!token) {
        return res.status(401).send({ err: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token,'masai');
        
        if (!decoded) {
            return res.status(403).send({ err: 'Access denied. Invalid Token.' });
        }
        req.user = decoded.userId
        next();
    } catch (error) {
        console.error(error);
        return res.status(400).send({ err: 'Invalid token.' });
    }
}

module.exports = UserMiddleware;