const ErrorHandler = require("../utils/ErrorHandler");
const orderModel = require("../models/order");
const stockHandler = require("../utils/StockHandler");
const {invalidate} = require("./product");
const NodeCache = require("node-cache");
const orderCache = new NodeCache();

const newOrder=async(req,res,next)=>{
    try{
        let {orderInfo,shipping,total,user,shippingInfo} = req.body;

        if(!orderInfo || !shipping || !total || !user || !shippingInfo){
            return next(new ErrorHandler("Missing Data!",400));
        }
        let flag = false;
        if(shipping=="Free"){
            flag = true;
        }

        await orderModel.create({...req.body,shipping : flag ? 0 : shipping});

        await stockHandler(orderInfo);
        await invalidate({product : true});
        await orderInvalidator({order : true,userId : user});

        return res.status(201).json({
            message : "Order Successfully Placed",
            succes : true
        })
    }
    catch(err){
        next(err);
    }
}

const myOrder=async(req,res,next)=>{
    try{
        let orders;
        const id = req.query.id;
        if(orderCache.has(`my-orders-${id}`)){
            orders = JSON.parse(orderCache.get(`my-orders-${id}`));
        }else{
            orders = await orderModel.find({user : id});
            orderCache.set(`my-orders-${id}`,JSON.stringify(orders));
        }
        
        res.status(200).json({
            succes : true,
            data : orders
        })
    }
    catch(err){
        next(err);
    }
}

const allOrders = async(req,res,next)=>{
    try{
        let order;
        if(orderCache.has("all-orders")){
            order = JSON.parse(orderCache.get("all-orders"));
        }else{
            order = await orderModel.find({}).populate("user","name");
            if(!order.length) return next(new ErrorHandler("No Orders Exists!",404));
            orderCache.set("all-orders",JSON.stringify(order));
        }
        return res.status(200).json({
            succes : true,
            data : order
        })
    }
    catch(e){
        next(e);
    }
}

const singleOrder = async(req,res,next)=>{
    try{
        let order;
        const {id} = req.params;
        if(orderCache.has(`single-orders-${id}`)){
            order = JSON.parse(orderCache.get(`single-orders-${id}`));
        }else{
            order = await orderModel.findById(id).populate("user","name");
            if(!order) return next(new ErrorHandler("No Orders Found!",404));
            orderCache.set(`single-orders-${id}`,JSON.stringify(order));
        }

        return res.status(200).json({
            succes : true,
            data : order
        })
    }
    catch(e){
        next(e);
    }
}


const updateStatus=async(req,res,next)=>{
    try{
        const {id} = req.params;
        const order = await orderModel.findById(id);

        if(!order) return next(new ErrorHandler("Order Not Found!",404));

        switch(order.status){
            case "Processing" : 
                order.status = "Shipped";
                break;
            case "Shipped" :
                order.status = "Delivered";
                break;
            default :
                order.status = "Delivered";
                break;
        }
        await orderInvalidator({order : true,userId : order.user});
        await order.save();
    
        return res.status(200).json({
            message : "Status Updated Successfully!",
            succes : true
        })

    }
    catch(err){
        next(err);
    }
}

const deleteOrder=async(req,res,next)=>{
    try{
        const {id} = req.params;
        const order = await orderModel.findById(id);

        if(!order) return next(new ErrorHandler("Order Not Found!",404));

        await orderInvalidator({order : true,userId : order.user});
        await order.deleteOne();
        
        return res.status(200).json({
            message : "Deleted Successfully!",
            succes : true
        })

    }
    catch(e){
        next(e);
    }
}

const cancelOrder=async(req,res,next)=>{
    try{
        const {id} = req.params;
        const order = await orderModel.findById(id);

        if(!order) return next(new ErrorHandler("Order Not Found!",404));

        order.status = "Cancelled";

        await orderInvalidator({order : true,userId : order.user});
        await order.save();
    
        return res.status(200).json({
            message : "Order Cancelled Successfully!",
            succes : true
        })

    }
    catch(err){
        next(err);
    }
}

const orderInvalidator=async({order,userId})=>{
    if(order){
        const orderKey = ["all-orders",`my-orders-${userId}`];

        const order = await orderModel.find({}).select("_id");
        order.forEach(el=>{
            orderKey.push(`single-orders-${el._id}`);
        });

        orderCache.del(orderKey);
    }
}

module.exports = {
    newOrder,
    myOrder,
    allOrders,
    singleOrder,
    updateStatus,
    deleteOrder,
    cancelOrder
};