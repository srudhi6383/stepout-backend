const express = require('express');
const jwt = require('jsonwebtoken');

function AdminMiddleware(req, res, next) {
    // Get the token from cookies
    const token = req.cookies.railway_token; // Change to read from cookies

    if (!token) {
        return res.status(401).send({ err: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'masai');
        
        // Check if the user is an admin
        if (!decoded.Admin) {
            return res.status(403).send({ err: 'Access denied. You are not an admin.' });
        }
        
        // Attach user information to request for further processing
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        return res.status(400).send({ err: 'Invalid token.' });
    }
}

module.exports = AdminMiddleware;