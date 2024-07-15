const mongoose = require('mongoose')

const User_Schema = new mongoose.Schema({
    'username':{
        type:String,
        required:true,
        unique:true
    },
    'password':{
        type:String,
        required:true,
    },
    'bookings':{
        type:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking' // Reference to the Booking model
        }]
    },
    'email':{
        type:String,
        require:true,
        unique:true
    }
    
})
const User_model = new mongoose.model('User',User_Schema)

module.exports = {
    User_model
}