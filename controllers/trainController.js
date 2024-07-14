const { Train_model } = require('../models/Train');
const { Booking_model } = require('../models/Booking');
const mongoose = require('mongoose');

exports.addTrain = async (req, res) => {
    const { train_name, source, destination, seat_capacity, arrival_time_at_source, arrival_time_at_destination } = req.body;

    if (!train_name || !source || !destination || (!seat_capacity || typeof seat_capacity !== 'number') ||
        (!arrival_time_at_source || !isValidDate(arrival_time_at_source)) || (!arrival_time_at_destination || !isValidDate(arrival_time_at_destination))) {
        return res.status(400).send({ err: 'Please provide all required details' });
    }

    try {
        const alreadyExists = await Train_model.findOne({ train_name });
        if (alreadyExists) {
            return res.status(400).send({ err: 'Train already exists, you may update the existing train detail' });
        }
        const newTrain = new Train_model({ train_name, source, destination, seat_capacity, arrival_time_at_source, arrival_time_at_destination });
        await newTrain.save();
        return res.status(200).send({ 'message': 'Train added successfully', "train_id": newTrain._id });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
};

exports.getSeatAvailability = async (req, res) => {
    const { destination, source, page = 1 } = req.query;
    const limit = 20;
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
};

exports.bookSeat = async (req, res) => {
    const train_id = req.params.train_id;
    const user_id = req.user;
    const { seat_numbers } = req.body;

    if (!train_id || !seat_numbers) {
        return res.status(400).send({ err: 'Please provide all required details' });
    }

    try {
        const train = await Train_model.findById(train_id);
        if (!train) {
            return res.status(404).send({ err: 'Train not found' });
        }

        const newBooking = new Booking_model({
            train_id: train._id,
            train_name: train.train_name,
            arrival_time_at_source: train.arrival_time_at_source,
            arrival_time_at_destination: train.arrival_time_at_destination,
            seat_numbers,
            user_id
        });

        await newBooking.save();

        return res.status(201).send({ 'message': 'Seat booked successfully', booking_id: newBooking._id });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
};

exports.getBookingDetails = async (req, res) => {
    const booking_id = req.params.booking_id;

    if (!booking_id || !mongoose.isValidObjectId(booking_id)) {
        return res.status(400).send({ err: 'Please provide all required details' });
    }

    try {
        const booking = await Booking_model.findById(booking_id);
        if (!booking) {
            return res.status(404).send({ err: 'Booking not found' });
        }

        return res.status(200).send({ 'message': 'Booking details fetched successfully', booking });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
};

exports.updateTrain = async (req, res) => {
    const train_id = req.params.train_id;
    const { train_name, source, destination, seat_capacity, arrival_time_at_source, arrival_time_at_destination } = req.body;

    if (!train_id || !mongoose.isValidObjectId(train_id) || !train_name || !source || !destination || (!seat_capacity || typeof seat_capacity !== 'number') ||
        (!arrival_time_at_source || !isValidDate(arrival_time_at_source)) || (!arrival_time_at_destination || !isValidDate(arrival_time_at_destination))) {
        return res.status(400).send({ err: 'Please provide all required details' });
    }

    try {
        const train = await Train_model.findById(train_id);
        if (!train) {
            return res.status(404).send({ err: 'Train not found' });
        }

        train.train_name = train_name;
        train.source = source;
        train.destination = destination;
        train.seat_capacity = seat_capacity;
        train.arrival_time_at_source = arrival_time_at_source;
        train.arrival_time_at_destination = arrival_time_at_destination;

        await train.save();

        return res.status(200).send({ 'message': 'Train updated successfully', train });
    } catch (error) {
        console.error(error);
        res.status(500).send({ err: 'Internal server error' });
    }
};

function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}
