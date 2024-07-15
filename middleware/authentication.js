const jwt = require("jsonwebtoken");
require("dotenv").config();

const authentication = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ message: "Authorization header is missing. Please log in." });
  }

  const token = auth.split(' ')[1];

  jwt.verify(token, process.env.secrettoken, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }

    req.user = decoded;  // Store the decoded token payload in the request
    next();  // Proceed to the next middleware or route handler
  });
};

module.exports = { authentication };