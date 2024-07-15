const express = require('express');
const { Train_model } = require('../models/Train');
const AdminMiddleware = require('../middleware/admin');
const UserMiddleware = require('../middleware/userMidlleware');
const mongoose = require('mongoose');
const { User_model } = require('../models/User');
const { Booking_model } = require('../models/Booking');
const Train_Route = express.Router()

Train_Route.post('/api/trains/create',AdminMiddleware,async(req,res)=>{
    const {train_name,source,destination,seat_capacity,
        arrival_time_at_source,arrival_time_at_destination} = req.body
    if(!train_name||!source||!destination||(!seat_capacity||!typeof(seat_capacity)=='number')||
        (!arrival_time_at_source||!isValidDate(arrival_time_at_source))||(!arrival_time_at_destination||!isValidDate(arrival_time_at_destination))){
            return res.status(400).send({ err: 'Please provide all required  details' });
    }
    try {
        const alreayexists = await Train_model.findOne({train_name})
        if(alreayexists){
            return res.status(400).send({ err: 'Train  already exists ,you may update the existing train detail' });
        }
        const newtrain = new Train_model({train_name,source,destination,seat_capacity,
            arrival_time_at_source,arrival_time_at_destination})
        await newtrain.save()
        return res.status(200).send({'message':'Train added successfully',
                                        "train_id":newtrain._id})
        
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
})

Train_Route.get('/api/trains/availability', async (req, res) => {
    const { destination, source, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    let pipeline = [];

    if (source) {
        pipeline.push({ $match: { source } });
    }
    if (destination) {
        pipeline.push({ $match: { destination } });
    }

    pipeline.push({
        $facet: {
            totalCount: [{ $count: "count" }],
            results: [{ $skip: skip }, { $limit: limit }]
        }
    });

    try {
        const result = await Train_model.aggregate(pipeline);
       
        const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
        const results = result[0].results;

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).send({
            page: parseInt(page),
            per_page: limit,
            total_count: totalCount,
            total_pages: totalPages,
            results: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
});

Train_Route.post('/api/trains/:train_id/book', UserMiddleware, async (req, res) => {
    const train_id = req.params.train_id;
    const user_id = req.user;
    let { no_of_seats } = req.body;
    if (!no_of_seats) {
        no_of_seats = 1;
    }

    if (!train_id) {
        return res.status(400).send({ err: "Please provide train ID" });
    }

    if (!mongoose.isValidObjectId(train_id)) {
        return res.status(400).send({ err: "Invalid train ID format" });
    }

    // Start a session and transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const train_exists = await Train_model.findById(train_id).session(session);
        if (!train_exists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({ err: 'Train does not exist, please check the details again' });
        }

        if (train_exists.seat_capacity <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({ err: 'No seats are available' });
        }

        if (train_exists.seat_capacity < no_of_seats) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ err: 'Not enough seats available' });
        }

        // Calculate starting seat number based on total capacity
        const total_seats = 100; // Assume total seats is 100
        const available_seats = train_exists.seat_capacity;

        // Calculate the first seat number to book
        const start_seat_number = total_seats - available_seats + 1;

        // Calculate booked seat numbers
        const booked_seat_numbers = [];
        for (let i = 0; i < no_of_seats; i++) {
            booked_seat_numbers.push(start_seat_number + i);
        }

        // Update the seat capacity
        train_exists.seat_capacity -= no_of_seats;

        // Create a new booking
        const newBooking = new Booking_model({
            train_id: train_exists._id,
            train_name: train_exists.train_name,
            arrival_time_at_source: train_exists.arrival_time_at_source,
            arrival_time_at_destination: train_exists.arrival_time_at_destination,
            seat_numbers: booked_seat_numbers,
            user_id: user_id
        });

        await newBooking.save({ session });

        const booking_user = await User_model.findById(user_id).session(session);
        if (!booking_user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({ err: 'User does not exist, please log in again.' });
        }

        booking_user.bookings.push(newBooking._id);
        await booking_user.save({ session });

        await train_exists.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.send({
            message: "Seat booked successfully",
            booking_id: newBooking._id,
            seat_numbers: booked_seat_numbers
        });
    } catch (error) {
        console.error(error);
        if (session.inTransaction()) {
            await session.abortTransaction();
            session.endSession();
        }
        res.status(500).send({ err: 'Internal server error' });
    }
});
Train_Route.get('/api/bookings/:booking_id',UserMiddleware,async(req,res)=>{
    const user_id = req.user;
    const booking_id = req.params.booking_id
    try {
        if (!booking_id) {
            return res.status(400).send({ err: "Please provide booking ID" });
        }
        if (!mongoose.isValidObjectId(booking_id)) {
            return res.status(400).send({ err: "Invalid Booking ID format" });
        }
        const booking_detail = await Booking_model.findById(booking_id)
        res.status(200).send(booking_detail)

        
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
})
Train_Route.put('/api/train/:train_id/update', AdminMiddleware, async (req, res) => {
    const { train_name, source, destination, seat_capacity, arrival_time_at_source, arrival_time_at_destination } = req.body;
    
    if (!train_name || !source || !destination || (!seat_capacity || typeof(seat_capacity) !== 'number') ||
        (!arrival_time_at_source || !isValidDate(arrival_time_at_source)) || (!arrival_time_at_destination || !isValidDate(arrival_time_at_destination))) {
        return res.status(400).send({ err: 'Please provide all required details' });
    }
    
    const train_id = req.params.train_id;

    if (!mongoose.isValidObjectId(train_id)) {
        return res.status(400).send({ err: 'Invalid train ID format' });
    }

    try {
        const updatedTrain = await Train_model.findByIdAndUpdate(
            train_id,
            {
                train_name,
                source,
                destination,
                seat_capacity,
                arrival_time_at_source,
                arrival_time_at_destination
            },
            { new: true, runValidators: true }
        );

        if (!updatedTrain) {
            return res.status(404).send({ err: 'No such train found to update' });
        }
        
        res.send({
            message: 'Train details updated successfully',
            train: updatedTrain
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
});


function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}
module.exports = {
    Train_Route
}