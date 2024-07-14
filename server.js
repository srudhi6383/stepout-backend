const express = require('express');
const { connectDB } = require('./db');
const User_Router = require('./routes/userRoutes');
const Train_Route = require('./routes/trainRoutes');
require('dotenv').config();
const cookieparser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(cookieparser());
app.use('/user', User_Router);
app.use('/train', Train_Route);

app.get('/', (req, res) => {
    res.send('Hi, your Railway server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
