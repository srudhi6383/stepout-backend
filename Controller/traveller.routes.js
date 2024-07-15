const express = require("express");
const { TrainModel } = require("../Models/TrainModel");
const { generateBookingID, finalTime } = require("../config");
const { BookingModel } = require("../Models/Bookings");

const travellerRouter = express.Router();

require("dotenv").config();

travellerRouter.get("/trains", async (req, res) => {
  let { source, destination } = req.body;

  source = source.toLowerCase();
  destination = destination.toLowerCase();

  try {
    const trainLists = await TrainModel.find({
      source: source,
      destination: destination,
    });
    if (trainLists) {
      res.json({
        message: `These are all trains between ${source} and ${destination}.`,
        trainList: trainLists,
      });
    } else {
      res.json({ message: "No train found " });
    }
  } catch (err) {
    console.log("Facing issues while getting trains ", err);
  }
});

travellerRouter.post("/book", async (req, res) => {
  let {
    name,
    age,
    email,
    mobile,
    address,
    trainName,
    trainNumber,
    source,
    destination,
    bookedSeatNo,
    userId,
  } = req.body;

  const availableTrain = await TrainModel.findOne({
    trainNumber: trainNumber,
  });

  console.log(availableTrain.seats);

  //   return;

  let availableSeats = availableTrain.seats;

  console.log(availableSeats);

  if (availableSeats > 0) {
    bookedSeatNo = availableSeats;
    availableSeats = availableSeats - 1;
    console.log(availableSeats);
  } else {
    return res.json({ message: "No seats available" });
  }

  const updateTrainSeats = await TrainModel.findOneAndUpdate(
    { source: source, destination: destination, trainNumber: trainNumber },
    { seats: availableSeats },
    { new: true }
  );

  try {
    const newBooking = await BookingModel.create({
      name,
      age,
      email,
      mobile,
      address,
      trainName: availableTrain.trainName,
      trainNumber,
      source,
      destination,
      bookedSeatNo,
      bookingTime: finalTime,
      bookingId: generateBookingID(),
      userId,
    });

    return res.json({
      message: "You have successfully booked a ticket",
      data: newBooking,
    });
  } catch (err) {
    console.log(err);
  }
});

travellerRouter.get("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  console.log(bookingId);

  try {
    const bookingDetails = await BookingModel.findOne({ bookingId: bookingId });
    
    return res.json({
      message: "Here is your booking detail",
      Details: bookingDetails,
    });
  } catch (err) {
    console.log("Facing some issue while getting the booking details");
  }
});

module.exports = { travellerRouter };