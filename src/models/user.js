const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    _id : {
        type : String,
        required : [true,"Please enter ID"]
    },
    name : {
        type : String,
        required : [true,"Please enter name"]
    },
    username : {
        type : String,
        required : [true,"Please enter username"],
        unique : [true],
        validate : validator.default.isEmail,
    },
    password : {
        type : String,
        required : [true,"Please enter password"]
    },
    dob : {
        type : Date,
        required : [true,"Please enter dob"]
    },
    photo : {
        type : String,
        required : [true,"Please add photo"]
    },
    phoneNo : {
        type : String,
        default : "null"
    },
    role : {
        type : String,
        enum : ["admin","user"],
        default : "user"
    },
    gender : {
        type : String,
        enum : ["Male","Female"],
        required : [true,"Please enter gender"]
    }
},{timestamps : true});

userSchema.virtual("age").get(function(){
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if(today.getMonth() < dob.getMonth() || (today.getMonth() < dob.getMonth() && today.getDate() < dob.getDate())) age-- ;
    return age;
});

const userModel = mongoose.model("User",userSchema);

module.exports = userModel;
