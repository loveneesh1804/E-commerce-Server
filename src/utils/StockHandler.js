const productModel = require("../models/products");

const stockHandler=async(orderInfo)=>{
    for(let i=0;i<orderInfo.length;i++){
        const order = orderInfo[i];
        const product = await productModel.findById(order._id);
        if(!product) throw new Error("Product Not Found!");
        if(product.stock<=0) throw new Error("Item Out Of Stock!")
        product.stock -= order.quantity;
        await product.save();
    }
};

module.exports = stockHandler;