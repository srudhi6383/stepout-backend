const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    train_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    train_name: {
        type: String,
        required: true
    },
    arrival_time_at_source: {
        type: Date,
        required: true
    },
    arrival_time_at_destination: {
        type: Date,
        required: true
    },
    booking_date: {
        type: Date,
        default: Date.now
    },
    seat_numbers: {
        type: [Number],
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
