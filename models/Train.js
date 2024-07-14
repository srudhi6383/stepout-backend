const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
    train_name: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    seat_capacity: { type: Number, required: true },
    arrival_time_at_source: { type: Date, required: true },
    arrival_time_at_destination: { type: Date, required: true }
});

const Train = mongoose.model('Train', TrainSchema);

module.exports = Train;
