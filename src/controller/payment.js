const couponModel = require("../models/coupon");
const ErrorHandler = require("../utils/ErrorHandler");
const Stripe = require("stripe");
require("dotenv").config();
const stripe = new Stripe(process.env.STRIPE_KEY);


const newPayment = async(req,res,next)=>{
    try{
        const {amount} = req.body;
        if(!amount) return next(new ErrorHandler("Amount is Missing!",400));

        const paymentIntent = await stripe.paymentIntents.create({
            amount : Number(amount) * 100,
            currency : "inr"
        });

        return res.status(200).json({
            succes : true,
            clientSecret : paymentIntent.client_secret
        })
    }
    catch(e){
        next(e);
    }
}

const newCoupon = async(req,res,next)=>{
    try{
        const {coupon,discount} = req.body;
        if(!coupon || !discount){
            return next(new ErrorHandler("Missing Data",400));
        }
        await couponModel.create({coupon : coupon.toUpperCase(),discount});

        return res.status(201).json({
            message : "Coupon Successfully Created!",
            succes : true
        })

    }
    catch(err){
        next(err);
    }
}

const applyCoupon = async(req,res,next)=>{
    try{
        const {coupon} = req.query;
        if(!coupon) return next(new ErrorHandler("Missing Coupon Code",404));

        const code = await couponModel.findOne({coupon : coupon.toUpperCase()});
        if(!code) return next(new ErrorHandler("Invalid Coupon!",400));

        return res.status(200).json({
            success : true,
            discount : code.discount
        })

    }
    catch(err){
        next(err);
    }
}

const allCoupons = async(req,res,next)=>{
    try{
        const coupons = await couponModel.find({});
        if(!coupons.length) return next(new ErrorHandler("No Coupons Exists!",404));

        return res.status(200).json({
            succes : true,
            data : coupons
        })
    }
    catch(e){
        next(e);
    }
}

const deleteCoupon=async(req,res,next)=>{
    try{
        const {id} = req.params;

        const coupon = await couponModel.findByIdAndDelete(id);
        if(!coupon) return next(new ErrorHandler("Invalid Coupon Code!",400));

        return res.status(200).json({
            message : `${coupon.coupon} Deleted Successfully!`,
            succes : true
        })
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    newCoupon,
    applyCoupon,
    allCoupons,
    deleteCoupon,
    newPayment
}