const { User_model } = require("../models/User");
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User_Router = express.Router();

User_Router.post('/api/signup', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).send({ err: 'Please provide all required details' });
    }

    try {
        // Check if the username or email already exists
        const already_exists = await User_model.findOne({ $or: [{ username }, { email }] });
        if (already_exists) {
            return res.status(400).send({ err: 'Username or Email already exists' });
        }
        // Hash password
        bcrypt.hash(password, 5, async function(err, hash) {
            if (err) {
                return res.status(500).json({ err: err.message });
            }
            // Create a new user
            const newUser = new User_model({ username, password: hash, email });
            // Save user
            await newUser.save();
            
            res.status(201).send({
                "status": "Account successfully created",
                "status_code": 201,
                "user_id": newUser._id
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
});

User_Router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ err: 'Please provide all required details' });
    }
    try {
        const user_exists = await User_model.findOne({ username });
        if (!user_exists) {
            return res.status(400).send({ err: 'No such user exists' });
        }
        bcrypt.compare(password, user_exists.password, function(err, result) {
            if (err) {
                return res.status(500).send({ err: 'Internal server error' });
            }
            if (!result) {
                return res.status(400).send({
                    "status": "Incorrect username/password provided. Please retry again", 
                    "status_code": 400
            });
            }
            const isadmin = username==='Admin'
            const token = jwt.sign({ userId: user_exists._id,Admin:isadmin }, process.env.JWT_SECRET || 'masai', { expiresIn: '1h' });
            res.cookie('railway_token',token, { httpOnly: true, secure: true })
            return res.status(200).send({
                "status": "Login successful",
                "status_code": 200,
                "user_id": user_exists._id,
                "access_token": token
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
});

module.exports = User_Router;