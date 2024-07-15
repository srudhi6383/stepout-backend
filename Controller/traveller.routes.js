const express = require("express");
const { TrainModel } = require("../Models/TrainModel");
const { generateBookingID, finalTime } = require("../config");
const { BookingModel } = require("../Models/Bookings");
const { authentication } = require("../middleware/authentication");

const travellerRouter = express.Router();

// Apply authentication middleware to protect the routes
travellerRouter.use(authentication);

travellerRouter.post("/trains", async (req, res) => {
  const { source, destination } = req.body;

  if (!source || !destination) {
    return res.status(400).json({ message: "Source and destination are required." });
  }

  try {
    const trainLists = await TrainModel.find({
      source: source.toLowerCase(),
      destination: destination.toLowerCase(),
    });

    if (trainLists.length > 0) {
      res.json({
        message: `These are all trains between ${source} and ${destination}.`,
        trainList: trainLists,
      });
    } else {
      res.status(404).json({ message: "No trains found" });
    }
  } catch (err) {
    console.error("Facing issues while getting trains", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

travellerRouter.post("/book", async (req, res) => {
  const {
    name,
    age,
    email,
    mobile,
    address,
    trainNumber,
    source,
    destination,
    userId,
  } = req.body;

  if (!name || !age || !email || !mobile || !address || !trainNumber || !source || !destination || !userId) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const availableTrain = await TrainModel.findOne({
      source: source.toLowerCase(),
      destination: destination.toLowerCase(),
      trainNumber,
    });

    if (!availableTrain) {
      return res.status(404).json({ message: "Train not found" });
    }

    if (availableTrain.seats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    const bookedSeatNo = availableTrain.seats;
    availableTrain.seats -= 1;

    await availableTrain.save();

    const newBooking = await BookingModel.create({
      name,
      age,
      email,
      mobile,
      address,
      trainName: availableTrain.trainName,
      trainNumber,
      source: availableTrain.source,
      destination: availableTrain.destination,
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
    console.error("Error during booking", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

travellerRouter.get("/bookings/:bookingId", async (req, res) => {
  const { bookingId } = req.params;

  try {
    const bookingDetails = await BookingModel.findOne({ bookingId });

    if (!bookingDetails) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json({
      message: "Here is your booking detail",
      Details: bookingDetails,
    });
  } catch (err) {
    console.error("Facing some issue while getting the booking details", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = { travellerRouter };