const userModel = require("../models/user");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const tokenAuth = async(req,res,next)=>{
    try{
        const {id} = req.params;
        const token = req.headers.authorization;
        if(!token) return next(new ErrorHandler("Missing Token",401));

        const isToken = jwt.verify(token,process.env.TOKEN_KEY);
        if(isToken){
            if(isToken.id !== id) return next(new ErrorHandler("Invalid User Token",401));
            return next();
        }
        return next(new ErrorHandler("Invalid Token!",400));
    }
    catch(e){
        next(e);
    }
}   

module.exports = tokenAuth ;