const express = require("express");
const { UserModel } = require("../Models/UserModel");
const { TrainModel } = require("../Models/TrainModel");

const adminRouter = express.Router();
require("dotenv").config();

let accessBy = process.env.accessBy;

adminRouter.post("/train", async (req, res) => {
  let { trainName, trainNumber, source, destination, seats, userId } =
    req.body;

  if (
    !trainName ||
    !trainNumber ||
    !source ||
    !destination ||
    !seats
  ) {
    return res.json({ message: "Please fill all fields" });
  }

  if (seats * 1 > 500) {
    return res.json({ message: "You can not add more than 500 seats" });
  }

  trainName = trainName.toLowerCase();
  source = source.toLowerCase();
  destination = destination.toLowerCase();
  trainNumber = trainNumber.toLowerCase();

  const train = await TrainModel.findOne({
    trainNumber: trainNumber,
    trainName: trainName,
    source: source,
    destination: destination,
  });

  if (train) {
    return res.json({
      message: `Train Number: ${trainNumber} already added please add another train`,
    });
  }

  console.log(userId); 


  if (userId === "admin@gmail.com") {
    try {
      const newTrain = await TrainModel.create({
        trainName,
        trainNumber,
        source,
        destination,
        seats,
        admin:userId,
      });

      return res.json({
        message: "New Train Added Successfully",
        Train_Name: trainName,
      });
    } catch (err) {
      console.log(err);
      return res.json({ message: "Facing issue while adding a new train" });
    }
  } else {
    return res.json({
      message: "You are not an authorized person for this work! ",
    });
  }
});

module.exports = { adminRouter };