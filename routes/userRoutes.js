const express = require('express');
const { registerUser, loginUser, getUserDetails } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const User_Router = express.Router();

User_Router.post('/register', registerUser);
User_Router.post('/login', loginUser);
User_Router.get('/me', authMiddleware, getUserDetails); // Ensure authMiddleware is used here

module.exports = User_Router;
