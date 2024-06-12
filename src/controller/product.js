const ErrorHandler = require("../utils/ErrorHandler");
const productModel = require("../models/products");
const {rm} = require("fs");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const cloudinary = require("cloudinary");

const newProduct = async(req,res,next)=>{
    try{
        const {name,price,stock,category} = req.body;
        const photo = req.file;
        if(!photo) return next(new ErrorHandler("Please Add Photo!",400));
        if(!name || !price || !stock || !category){
            rm(photo.path,()=>console.log("Deleted Successfully !"));
            return next(new ErrorHandler("Missing Data",400));
        }
        const result = await cloudinary.v2.uploader.upload(photo.path);
        if(result){
            await productModel.create({
                name,
                stock,
                price,
                category,
                photo : result.secure_url
            });

            await invalidate({product : true});

            return res.status(201).json({
                message : "Product Created Successfully!",
                success : true
            })

        }
        else{
            return next(new ErrorHandler("Cloud Error",401));
        }
    }
    catch(err){
        return next(err);
    }
}

const latestProduct = async(req,res,next)=>{
    try{
        let latest;
        if(myCache.has("latest-product")){
            latest = JSON.parse(myCache.get("latest-product"));
        } 
        else{
            latest = await productModel.find({}).sort({createdAt : -1}).limit(10);
            if(latest.length===0) return next(new ErrorHandler("No Product Found!",404));
            myCache.set("latest-product",JSON.stringify(latest));
        }

        return res.status(200).json({
            success : true,
            data : latest,
            message : "SUCESS!"
        })
    }
    catch(err){
        next(err);
    }
}

const category = async(req,res,next)=>{
    try{
        let categories;
        if(myCache.has("category")){
            categories = JSON.parse(myCache.get("category"));
        }else{
            categories = await productModel.distinct("category");
            if(!categories) return next(new ErrorHandler("No user exists!",404));
            myCache.set("category",JSON.stringify(categories));
        }   
    
        return res.status(201).json({
            success : true,
            categories
        });
    }
    catch(err){
        next(err);
    }
}

const allProduct = async(req,res,next)=>{
    try{
        let all;
        if(myCache.has("all-products")){
            all = JSON.parse(myCache.get("all-products"));
        }else{
            all = await productModel.find({});
            if(all.length===0) return next(new ErrorHandler("No Product Found!",404));
            myCache.set("all-products",JSON.stringify(all));
        }
        
        res.status(200).json({
            success : true,
            data : all,
            message : "SUCESS!"
        })
    }
    catch(err){
        next(err);
    }
}

const singleProduct = async(req,res,next)=>{
    try{
        let single;
        const id = req.params.id;
        if(myCache.has(`product-${id}`)){
            single = JSON.parse(myCache.get(`product-${id}`));
        }else{
            single = await productModel.findById(req.params.id);
            if(!single) return next(new ErrorHandler("No Product Found!",404));
            myCache.set(`product-${id}`,JSON.stringify(single));
        }
        
        res.status(200).json({
            success : true,
            data : single,
            message : "SUCESS!"
        })
    }
    catch(err){
        next(err);
    }
}

const updateProduct = async(req,res,next)=>{
    try{
        const {name,price,stock,category} = req.body;
        const photo = req.file;
        const product = await productModel.findById(req.params.id);
        if(!product) return next(new ErrorHandler("Invalid ID!",404));

        if(photo){
            // rm(product.photo,()=>console.log("Deleted Successfully!"));
            const result = await cloudinary.v2.uploader.upload(photo.path);
            if(result)  product.photo = result.secure_url;
            else{
                return next(new ErrorHandler("Cloud Error",404));
            }
        }

        if(name) product.name = name;
        if(price) product.price = price;
        if(stock) product.stock = stock;
        if(category) product.category = category;

        await product.save();
        await invalidate({product : true});

        res.status(200).json({
            success : true,
            message : "UPDATED SUCCESSFULLY!"
        })
    }
    catch(err){
        next(err);
    }
}

const deleteProduct = async(req,res,next)=>{
    try{
        const single = await productModel.findById(req.params.id);
        if(!single) return next(new ErrorHandler("No Product Found!",404));
        // rm(single.photo,()=>console.log("Deleted Sucessfully!"))
        await productModel.deleteOne({_id : req.params.id});
        await invalidate({product : true});
        res.status(200).json({
            success : true,
            message : "DELETED SUCCESSFULLY!"
        })
    }
    catch(err){
        next(err);
    }
}

const searchProduct=async(req,res,next)=>{
    const {sort,search,category,price} = req.query;
    const page = Number(req.query.page) || 1;

    const limit = 12;
    const skip = (page - 1) * limit;

    const baseQuery = {};

    if(search){
        baseQuery.name = {
            $regex : search,
            $options : "i"
        }
    }
    if(price){
        baseQuery.price = {
            $lte : Number(price)
        }
    }
    if(category) baseQuery.category = category;

    const product = await productModel.find(baseQuery).sort(sort && {price: sort==="ascending" ? 1 : -1}).limit(limit).skip(skip);

    if(product.length===0) return next(new ErrorHandler("No Product Exists!",404));

    const filteredProduct = await productModel.find(baseQuery);

    const totalPage = Math.ceil(filteredProduct.length / limit);

    return res.status(200).json({
        success : true,
        data : product,
        totalPage
    })
}

const invalidate = async({product})=>{
    if(product){
        const productKey = ["all-products","category","latest-product"];

        const product = await productModel.find({}).select("_id");
        product.forEach(el=>{
            productKey.push(`product-${el._id}`);
        })
        myCache.del(productKey);
    }
}

module.exports = {
    newProduct,
    latestProduct,
    allProduct,
    singleProduct,
    deleteProduct,
    updateProduct,
    searchProduct,
    category,
    invalidate
}
