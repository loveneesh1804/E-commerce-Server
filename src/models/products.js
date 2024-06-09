const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"Please enter name"]
    },
    photo : {
        type : String,
        required : [true,"Please enter photo"]
    },
    price : {
        type : Number,
        required : [true,"Please enter price"]
    },
    stock : {
        type : Number,
        required : [true,"Please enter stock"]
    },
    category : {
        type : String,
        required : [true,"Please enter category"],
        trim : true
    },
},{timestamps : true})

const productModel = mongoose.model("Product",productSchema);
module.exports = productModel;