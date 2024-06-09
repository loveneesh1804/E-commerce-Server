const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    productId : {
        type : String,
        required : [true,"Please Enter Product ID"]
    },
    title : {
        type : String,
        required : [true,"Please Enter Title"]
    },
    comment : {
        type : String,
        required : [true,"Please Enter Comment"]
    },
    rating : {
        type : Number,
        enum: [1,2,3,4,5],
        required : [true,"Please enter price"]
    },
    photo : {
        type : String,
        required : [true,"Please Enter photo"]
    },
    user : {
        type : String,
        required : [true,"Please Enter username"]
    },
    userId : {
        type : String,
        required : [true,"Please Enter userId"]
    }
},{timestamps : true});

const reviewModel = mongoose.model("Review",reviewSchema);

module.exports = reviewModel;