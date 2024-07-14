const express = require('express');
const { addTrain, getSeatAvailability, bookSeat, getBookingDetails, updateTrain } = require('../controllers/trainController');
const AdminMiddleware = require('../middleware/admin');
const UserMiddleware = require('../middleware/userMidlleware'); 
const Train = require('../models/Train');

const Train_Route = express.Router();

Train_Route.post('/trains/create', AdminMiddleware, addTrain);
Train_Route.get('/trains/availability', getSeatAvailability);
Train_Route.post('/trains/:train_id/book', UserMiddleware, bookSeat);
Train_Route.get('/bookings/:booking_id', UserMiddleware, getBookingDetails);
Train_Route.put('/trains/:train_id/update', AdminMiddleware, updateTrain);

module.exports = Train_Route;
