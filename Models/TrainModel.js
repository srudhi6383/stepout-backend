const mongoose = require("mongoose");

const trainSchema = mongoose.Schema({
    trainName:{type:String,required:true},
    trainNumber:{type:String,required:true},
    source : {type:String,required:true},
    destination:{type:String,required:true},
    seats:{type:Number,required:true},
    admin:{type:String}
});

const TrainModel = mongoose.model("train",trainSchema)

module.exports = {trainSchema,TrainModel}