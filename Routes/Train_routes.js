const express = require('express');
const { Train_model } = require('../Models/Train_model');
const AdminMiddleware = require('../Middleware/AdminMiddleware');
const UserMiddleware = require('../Middleware/UserMiddleware');
const mongoose = require('mongoose');
const { User_model } = require('../Models/User_model');
const { Booking_model } = require('../Models/Booking_model');
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
        // Optimistic locking: find the train and lock the document for update
        const train_exists = await Train_model.findOneAndUpdate(
            { _id: train_id },
            { $inc: { seat_capacity: -no_of_seats } },
            { new: true, session, runValidators: true }
        );

        if (!train_exists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({ err: 'Train does not exist, please check the details again' });
        }

        if (train_exists.seat_capacity < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ err: 'Not enough seats available' });
        }

        // Calculate starting seat number based on total capacity
        const total_seats = 100; // Assume total seats is 100
        const available_seats = train_exists.seat_capacity + no_of_seats;

        // Calculate the first seat number to book
        const start_seat_number = total_seats - available_seats + 1;

        // Calculate booked seat numbers
        const booked_seat_numbers = [];
        for (let i = 0; i < no_of_seats; i++) {
            booked_seat_numbers.push(start_seat_number + i);
        }

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
    const train_id = req.params.train_id;

    if (!mongoose.isValidObjectId(train_id)) {
        return res.status(400).send({ err: 'Invalid train ID format' });
    }

    try {
        // Find the existing train record
        const existingTrain = await Train_model.findById(train_id);
        if (!existingTrain) {
            return res.status(404).send({ err: 'No such train found to update' });
        }

        // Create an update object based on provided fields
        const updateFields = {};

        if (req.body.train_name) updateFields.train_name = req.body.train_name;
        if (req.body.source) updateFields.source = req.body.source;
        if (req.body.destination) updateFields.destination = req.body.destination;
        if (req.body.seat_capacity !== undefined) updateFields.seat_capacity = req.body.seat_capacity;
        if (req.body.arrival_time_at_source) updateFields.arrival_time_at_source = req.body.arrival_time_at_source;
        if (req.body.arrival_time_at_destination) updateFields.arrival_time_at_destination = req.body.arrival_time_at_destination;

        // Update the train record with only provided fields
        const updatedTrain = await Train_model.findByIdAndUpdate(
            train_id,
            updateFields,
            { new: true, runValidators: true }
        );

        res.send({
            message: 'Train details updated successfully',
            train: updatedTrain
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
});
Train_Route.get('/api/userbooking', UserMiddleware, async (req, res) => {
    const user_id =req.user; 

    try {
        const userBookings = await Booking_model.find({ user_id: user_id });
        res.status(200).json(userBookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}
module.exports = {
    Train_Route
}