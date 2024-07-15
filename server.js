const express = require("express");
const cors = require("cors");
const { userRouter } = require("./Controller/user.routes.js");
const { authentication } = require("./middleware/authentication.js");
const { connection } = require("./db");
const { adminRouter } = require("./Controller/admin.routes.js");
const { travellerRouter } = require("./Controller/traveller.routes.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());


// Base Route
app.get("/", (req, res) => {
  res.json({ message: "IRCTC API is working fine" });
});

// User Routes
app.use("/", userRouter); 

// Authentication Middleware 
app.use(authentication);
 
// Admin and Traveller Routes
app.use("/admin", adminRouter);
app.use("/", travellerRouter);

// Start Server
app.listen(PORT, async () => {
  try {
    await connection;
    console.log("App is connected to MongoDB database IRCTC");
  } catch (err) {
    console.error("Failed to connect to the database", err);
  }
  console.log(`App is running on port ${PORT}`);
});