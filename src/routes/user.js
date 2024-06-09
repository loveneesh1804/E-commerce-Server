const express = require("express");
const userRoute = express.Router();
const userController = require("../controller/user");
const admin = require("../middleware/auth");
const tokenAuth = require("../middleware/token");
const singleUpload = require("../middleware/multer");


// /api/user/
userRoute.post("/new",userController.registerUser);

userRoute.post("/login",userController.loginUser);

userRoute.get("/all",admin,userController.fetchAllUsers);

userRoute.route("/:id")
.get(tokenAuth,userController.fetchUser)
.delete(admin,userController.deleteUser)
.put(singleUpload,userController.updateUser);

userRoute.post("/photo/:id",userController.deletePhoto);

userRoute.post('/reset/:id',userController.resetPassword);


module.exports = userRoute;