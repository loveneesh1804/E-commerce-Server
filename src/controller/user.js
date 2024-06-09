const userModel = require("../models/user");
const reviewModel = require("../models/review");
const ErrorHandler = require("../utils/ErrorHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {rm} = require("fs");


const registerUser = async(req,res,next)=>{
    try{
        const {_id,name,username,dob,photo,gender,password} = req.body;
        if(!_id || !name || !username || !dob || !photo || !gender || !password){
            return next(new ErrorHandler("Missing Data",400));
        }
        const userExists = await userModel.findOne({username : req.body.username});
        if(userExists){
            return next(new ErrorHandler("User Alredy Exists!"))
        }
        bcrypt.hash(password,Number(process.env.SALT_ROUND),async(err,hash)=>{
            if(err){
                return next(new ErrorHandler("Encryption Went Wrong!",404));
            }
            const user = await userModel.create({
                _id,name,username,password : hash,dob,photo,gender
            });
        
            return res.status(201).json({
                message : "Account Created Successfully!",
                sucess : true
            })
        })

        
    } 
    catch(e){
        return next(e);
    }
}

const loginUser = async(req,response,next)=>{
    try{
        const {username,password} = req.body;
        if(!username || !password){
            return next(new ErrorHandler("Incomplete Credentials"));
        }
        const userExists = await userModel.findOne({username : req.body.username});
        if(!userExists){
            return next(new ErrorHandler("Invalid Credentials!",401));
        }
        if(userExists){
            bcrypt.compare(password,userExists.password,(err,res)=>{
                if(err){
                    return next(new ErrorHandler("Encryption Went Wrong!",404));
                }
                if(!res){
                    return next(new ErrorHandler("Invalid Password!",401));
                }
                const token = jwt.sign({
                    id : userExists._id,
                    name : userExists.name,
                    role : userExists.role,
                    photo : userExists.photo
                },process.env.TOKEN_KEY,{expiresIn : "1h"});

                return response.status(200).json({
                    message : `Welcome ${userExists.name}`,
                    sucess : true,
                    token
                })
            })
        }
    }
    catch(e){
        next(e);
    }
}

const fetchAllUsers = async(req,res,next)=>{
    try{
        const users = await userModel.find({});
        if(!users.length){
            return next(new ErrorHandler("No User Exists!",404));
        }
        return res.status(200).json({
            message : "Sucessfully fetched",
            data : users,
            sucess : true
        })
    }
    catch(err){
        return next(err);
    }
}

const fetchUser = async(req,res,next)=>{
    try{
        const user = await userModel.findById(req.params.id);
        if(!user){
            return next(new ErrorHandler("Invalid ID",404));
        }
        return res.status(200).json({
            message : `Welcome ${user.name}`,
            sucess : true,
            data : user
        })
    }
    catch(err){
        return next(err);
    }
}

const deleteUser = async(req,res,next)=>{
    try{
        const user = await userModel.findById(req.params.id);
        if(!user){
            return next(new ErrorHandler("Invalid ID",404));
        }
        await user.deleteOne();
        return res.status(200).json({
            message : "Deleted Successfully!",
            sucess : true
        })
    }
    catch(err){
        return next(new ErrorHandler("Invalid ID",404));
    }
}

const updateUser = async(req,res,next)=>{
    try{
        const {name,dob,phoneNo} = req.body;
        const photo = req.file;
        const user = await userModel.findById(req.params.id);
        if(!user) return next(new ErrorHandler("Invalid ID!",404));

        
        if(user.photo.split(" ")[0]!=="null" && photo){
            await reviewModel.updateMany({photo : user.photo},{$set : {photo : photo.path}})
            rm(user.photo,()=>console.log("Deleted Successfully!"));
            user.photo = photo.path;
        }
        if(user.photo.split(" ")[0]==="null" && photo){
            await reviewModel.updateMany({photo : user.photo},{$set : {photo : photo.path}})
            user.photo = photo.path;
        }
        
        if(name) {
            await reviewModel.updateMany({userId : req.params.id},{$set : {user : name}})
            user.name = name
        };
        if(dob) user.dob = dob;
        if(phoneNo) user.phoneNo = phoneNo;

        await user.save();

        res.status(200).json({
            success : true,
            message : "UPDATED SUCCFULLY!"
        })
    }
    catch(err){
        next(err);
    }
}

const deletePhoto = async(req,res,next)=>{
    try{
        const {id} = req.params;
        const {photo} = req.body;

        if(!id || !photo) return new ErrorHandler("Invalid Data!",400);

        const user = await userModel.findById(req.params.id);
        if(!user) return next(new ErrorHandler("Invalid ID!",404));

        if(user){
            await reviewModel.updateMany({photo : user.photo},{$set : {photo : photo}})
            rm(user.photo,()=>console.log("Deleted Successfully!"));
            user.photo = photo;
        }

        await user.save();

        res.status(200).json({
            success : true,
            message : "DELETED SUCCFULLY!"
        })

    }
    catch(e){
        return next(e);
    }
}

const resetPassword = async(req,res,next)=>{
    try{
        const {id} = req.params;
        const {newPassword,oldPassword} = req.body;

        if(!id || !newPassword || !oldPassword) return new ErrorHandler("Invalid Data");

        const user = await userModel.findById(req.params.id);
        if(!user) return next(new ErrorHandler("Invalid ID!",404));

        if(user){
            bcrypt.compare(oldPassword,user.password,(err,result)=>{
                if(err){
                    return next(new ErrorHandler("Encryption Went Wrong!",404));
                }
                if(!result){
                    return next(new ErrorHandler("Invalid Password!",401));
                }

                bcrypt.hash(newPassword,Number(process.env.SALT_ROUND),async(err,hash)=>{
                    if(err){
                        return next(new ErrorHandler("Encryption Went Wrong!",404));
                    }
                    user.password = hash;
                    await user.save();

                    res.status(200).json({
                        success : true,
                        message : "Password Changed Successfully"
                    })
                })

            })
        }
    }
    catch(e){
        return next(e);
    }

}


module.exports = {
    fetchAllUsers,
    registerUser,
    fetchUser,
    deleteUser,
    loginUser,
    updateUser,
    deletePhoto,
    resetPassword
}