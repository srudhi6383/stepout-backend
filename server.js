const express = require('express');
const { connectDB } = require('./db');
const cors = require('cors'); 
const User_Router = require('./Routes/User_routes');
const { Train_Route } = require('./Routes/Train_routes');
require('dotenv').config();
const cookieparser = require('cookie-parser')
const app = express();
app.use(cors({
    origin: 'https://master--iridescent-brigadeiros-af24fc.netlify.app/', // Replace with your frontend domain
    credentials: true
  }));
app.use(express.json());
app.use(cookieparser())

app.use('/user', User_Router);
app.use('/train',Train_Route)
app.get('/', (req, res) => {
    res.send('Hi, your Railway server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});