const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/UserModel");

require("dotenv").config();
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  let { name, email, password } = req.body;

  email = email.toLowerCase();

  if (!name || !email || !password) {
    return res.json({ message: "Please enter your name, email, and password" });
  }

  const user = await UserModel.findOne({ email });
  if (user) {
    return res.status(200).json({ status: "User Already Exists" });
  }

  try {
    bcrypt.hash(password, 8, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      await UserModel.create({
        name,
        email,
        password: hash,
        userId: process.env.accessBy,
      });

      res.json({ message: `User ${name} registered successfully` });
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

userRouter.post("/login", async (req, res) => {
  let { email, password } = req.body;

  email = email.toLowerCase();

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(404).json({ status: "User Not Found" });
  }

  try {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.status(404).json({ status: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.email }, process.env.secrettoken, { expiresIn: '1h' });
      res.status(200).json({ status: "Login Successful", token });
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = { userRouter };