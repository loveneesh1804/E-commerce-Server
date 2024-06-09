const express = require("express");
const admin = require("../middleware/auth");
const tokenAuth = require("../middleware/token");
const { newCoupon,applyCoupon,allCoupons,deleteCoupon,newPayment } = require("../controller/payment");
const paymentRoute = express.Router();

// /api/payment/
paymentRoute.post("/new",newPayment)

paymentRoute.post("/coupon/new",admin,newCoupon);

paymentRoute.get("/coupon/apply",applyCoupon);

paymentRoute.get("/coupon/all",admin,allCoupons);

paymentRoute.delete("/coupon/:id",admin,deleteCoupon)

module.exports = paymentRoute;