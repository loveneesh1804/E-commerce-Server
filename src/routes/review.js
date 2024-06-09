const express = require("express");
const reviewRoute = express.Router();
const {newReview,getReview,deleteReview} = require("../controller/review");

// /api/review
reviewRoute.post("/new/:id",newReview);

reviewRoute.get("/:id",getReview);

reviewRoute.delete("/:id",deleteReview);

module.exports = reviewRoute;