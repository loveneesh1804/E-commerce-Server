const express = require("express");
const { newOrder,myOrder,allOrders,singleOrder,updateStatus,deleteOrder,cancelOrder } = require("../controller/order");
const admin = require("../middleware/auth");


const orderRoute = express.Router();

// /api/order/
orderRoute.post("/new",newOrder);

orderRoute.get("/my",myOrder);

orderRoute.get("/all",admin,allOrders);

orderRoute.put("/cancel/:id",cancelOrder);

orderRoute.route("/:id").get(singleOrder).put(admin,updateStatus).delete(admin,deleteOrder);

module.exports = orderRoute;