const ErrorHandler = require("../utils/ErrorHandler");
const reviewModel = require("../models/review");
const productModel = require("../models/products");

const newReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return new ErrorHandler("Product ID is Empty!");

    const validId = await productModel.findById(id);
    if (!validId) return new ErrorHandler("Not a Valid Product Id!");

    const { rating, title, comment, photo,user,userId } = req.body;
    if (!rating || !title || !comment || !photo) {
      return new ErrorHandler("Incomplete Data!");
    }

    const review = await reviewModel.create({
      rating,
      photo,
      productId: id,
      comment,
      title,
      user,
      userId
    });

    if (review) {
      return res.status(201).json({
        success: true,
        message: "Review Published Successfully!",
      });
    }
  } catch (e) {
    return next(e);
  }
};

const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return new ErrorHandler("Invalid ID");

    const validId = await productModel.findById(id);
    if (!validId) return new ErrorHandler("Not a Valid Product Id!");

    const data = await reviewModel.find({ productId: id });

    if (!data) {
      return new ErrorHandler("Something Went Wrong!");
    }

    const rating5Promise = reviewModel
      .find({ productId: id, rating: 5 })
      .countDocuments();
    const rating4Promise = reviewModel
      .find({ productId: id, rating: 4 })
      .countDocuments();
    const rating3Promise = reviewModel
      .find({ productId: id, rating: 3 })
      .countDocuments();
    const rating2Promise = reviewModel
      .find({ productId: id, rating: 2 })
      .countDocuments();
    const rating1Promise = reviewModel
      .find({ productId: id, rating: 1 })
      .countDocuments();

    const [rating5, rating4, rating3, rating2, rating1,total] = await Promise.all([
      rating5Promise,
      rating4Promise,
      rating3Promise,
      rating2Promise,
      rating1Promise,
      reviewModel.find({productId : id}).countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      data,
      count : {
        total,
        r1 : rating1,
        r2 : rating2,
        r3 : rating3,
        r4 : rating4,
        r5 : rating5
      }
    });
  } catch (err) {
    return next(err);
  }
};

const deleteReview = async (req,res,next) =>{
  try{
    const {id} = req.params;
    if (!id) return new ErrorHandler("Invalid ID");

    const review = await reviewModel.findById(id);
    if(!review) return new ErrorHandler("Invalid Request");

    await  review.deleteOne();
    return res.status(200).json({
      message : "Review Deleted Successfully",
      success : true
    })
  }
  catch(e){
    return next(e);
  }
};

module.exports = {
  newReview,
  getReview,
  deleteReview
};
