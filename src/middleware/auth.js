const userModel = require("../models/user");
const ErrorHandler = require("../utils/ErrorHandler");

const admin = async(req,res,next)=>{
    try{
        const {id} = req.query;
        if(!id) return next(new ErrorHandler("Authentication Required!",401));

        const user = await userModel.findById(id);
        if(!user) return next(new ErrorHandler("Invalid Credentials!",401));
        if(user.role != "admin") return next(new ErrorHandler("Unauthorised Acess!",403));

        next();
    }catch(err){
        next(err);
    }
}   

module.exports = admin;