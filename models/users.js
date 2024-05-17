const mongoose  = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    enrollmentID:{
        type:Number,
        required:true
    },
    subject_name:{
        type:String,
        required:true
    },
    marks:{ 
        type:Number,
        required:true
    },
});
module.exports = mongoose.model("users",userSchema);
