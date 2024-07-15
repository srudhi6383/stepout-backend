const mongoose = require('mongoose');
const Train_schema = new mongoose.Schema({
    'train_name': {
        type: String,
        required: true
    },
    'source': {
        type: String,
        required: true
    },
    'destination': {
        type: String,
        required: true
    },
    'seat_capacity': {
        type: Number,
        required: true
    },
    'arrival_time_at_source': {
        type: Date,
        required: true
    },
    'arrival_time_at_destination': {
        type: Date,
        required: true
    }
});
const Train_model = mongoose.model('Train', Train_schema);

module.exports = {
    Train_model
};