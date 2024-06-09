const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    shippingInfo : {
        address : {
            type : String,
            required : true
        },
        city : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        phoneNumber : {
            type : String,
            required : true
        },
        pinCode : {
            type : Number,
            required : true
        }
    },
    user : {
        type : String,
        ref : "User",
        required : true
    },
    name : {
        type : String,
        required : true
    },
    total : {
        type : Number,
        required : true
    },
    subtotal : {
        type : Number,
        required : true
    },
    discount : {
        type : Number,
        required : true
    },
    tax : {
        type : Number,
        required : true
    },
    shipping : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        enum : ["Processing","Delivered","Shipped","Cancelled"],
        default : "Processing"
    },
    orderInfo : [{
        _id : {
            type : mongoose.Types.ObjectId,
            ref : "Product",
        },
        quantity : Number,
        name : String,
        photo : String,
        price : Number,
        size : String
    }
    ]
},
{
    timestamps : true
});

const orderModel = mongoose.model("Order",orderSchema);

module.exports = orderModel;