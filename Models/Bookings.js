const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String },
  mobile: { type: String },
  address: { type: String },
  trainName  : { type: String, required: true },
  trainNumber: { type: String, required: true },
  source     : { type: String, required: true },
  destination: { type: String, required: true },
  bookedSeatNo : { type: Number, required: true },
  bookingId  : { type: String, required: true },
  bookingTime: { type: String, required: true },
  userId: { type: String, required: true },
});

const BookingModel = mongoose.model("booking", bookingSchema);

module.exports = { bookingSchema, BookingModel };