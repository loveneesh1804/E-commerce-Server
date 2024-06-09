const express = require("express");
const {newProduct,latestProduct,searchProduct,allProduct,singleProduct,deleteProduct,updateProduct,category} = require("../controller/product");
const productRoute = express.Router();
const admin = require("../middleware/auth");
const singleUpload = require("../middleware/multer");


// /api/product/
productRoute.post("/new",singleUpload,admin,newProduct);

productRoute.get("/latest",latestProduct);

productRoute.get("/all",admin,allProduct);

productRoute.get("/category",category);

productRoute.post("/search",searchProduct);

productRoute.route("/:id").get(singleProduct).delete(admin,deleteProduct).put(admin,singleUpload,updateProduct);


module.exports = productRoute;