const mongoose = require('mongoose');
require('dotenv').config();

const { User } = require('./models/User');
const bcrypt = require('bcrypt');

async function addSampleData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const sampleUsers = [
            {
                username: 'user1',
                password: await bcrypt.hash('password1', 10)
            },
            {
                username: 'user2',
                password: await bcrypt.hash('password2', 10)
            }
        ];

        await User.insertMany(sampleUsers);
        console.log('Sample data added successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Failed to add sample data', error);
        mongoose.connection.close();
    }
}

addSampleData();
