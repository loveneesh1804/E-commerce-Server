const ErrorHandler = require("../utils/ErrorHandler");
const productModel = require("../models/products");
const userModel = require("../models/user");
const orderModel = require("../models/order");
const percentageHandler = require("../utils/PercentageHandler");

const dashboardInfo = async (req, res, next) => {
  try {
      const today = new Date();
      const sixMonthAgo = new Date();
      sixMonthAgo.setMonth(sixMonthAgo.getMonth()-6);

      const thisMonth = {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: today,
      };

      const lastMonth = {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth(), 0),
      };

      const thisMonthProductsPromise = productModel.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthProductsPromise = productModel.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const thisMonthUsersPromise = userModel.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthUsersPromise = userModel.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const thisMonthOrdersPromise = orderModel.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthOrdersPromise = orderModel.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const lastSixMonthOrdersPromise = orderModel.find({
        createdAt: {
          $gte: sixMonthAgo,
          $lte: today,
        },
      });

      const latestOrderPromise = orderModel.find({}).select(["total","status","orderInfo"]).sort({createdAt : -1}).limit(4);

      const [
        thisMonthProducts,
        thisMonthUsers,
        thisMonthOrders,
        lastMonthProducts,
        lastMonthUsers,
        lastMonthOrders,
        userCount,
        productCount,
        orderInfo,
        lastSixMonthOrders,
        category,
        femaleUser,
        latestOrder
      ] = await Promise.all([
        thisMonthProductsPromise,
        thisMonthUsersPromise,
        thisMonthOrdersPromise,
        lastMonthProductsPromise,
        lastMonthUsersPromise,
        lastMonthOrdersPromise,
        userModel.countDocuments(),
        productModel.countDocuments(),
        orderModel.find({}).select("total"),
        lastSixMonthOrdersPromise,
        productModel.distinct("category"),
        userModel.countDocuments({gender : "Female"}),
        latestOrderPromise
      ]);

      const thisMonthRevenue = thisMonthOrders.reduce(
        (acc, el) => (acc += el.total || 0),
        0
      );
      const lastMonthRevenue = lastMonthOrders.reduce(
        (acc, el) => (acc += el.total || 0),
        0
      );

      const percentage = {
        user: percentageHandler(thisMonthUsers.length, lastMonthUsers.length),
        product: percentageHandler(
          thisMonthProducts.length,
          lastMonthProducts.length
        ),
        order: percentageHandler(
          thisMonthOrders.length,
          lastMonthOrders.length
        ),
        revenue: percentageHandler(thisMonthRevenue, lastMonthRevenue),
      };

      const revenue = orderInfo.reduce((acc,el)=>acc+= (el.total || 0),0);

      const monthlyOrderCount = new Array(6).fill(0);
      const monthlyOrderRevenue = new Array(6).fill(0);

      const count = {
        revenue,
        user : userCount,
        product : productCount,
        order : orderInfo.length
      }

      lastSixMonthOrders.forEach(el=>{
        const createDate = el.createdAt;
        const monthDiff = ((today.getMonth() - createDate.getMonth()) + 12) % 12;

        if(monthDiff<6){
            monthlyOrderCount[6-monthDiff-1] += 1;
            monthlyOrderRevenue[6-monthDiff-1] += el.total;
        }
      })

      const categoryCountPromise = category.map(el=> productModel.countDocuments({category : el}))
      const categoryCount = await Promise.all(categoryCountPromise);

      const categories = [];

      category.forEach((el,i)=>{
        categories.push({
            [el] : Number(((categoryCount[i] / productCount) * 100).toFixed(0))
        })
      })

      const userRatio = {
        female : femaleUser,
        male : userCount - femaleUser
      }

      const latestTransaction = latestOrder.map(el=>({
        _id : el._id,
        amount : el.total,
        status : el.status,
        quantity : el.orderInfo.length
      }))

      const data = {
        categories,
        percentage,
        count,
        userRatio,
        chart : {
            order : monthlyOrderCount,
            revenue : monthlyOrderRevenue
        },
        latestTransaction
      };

    return res.status(200).json({
      sucess: true,
      data
    });

  } 
  catch (e) {
    next(e);
  }
};

const barInfo = async (req, res, next) => {
  try {
    const today = new Date();
    const sixMonthAgo = new Date();
    sixMonthAgo.setMonth(sixMonthAgo.getMonth()-6);

    const twelveMonthAgo = new Date();
    twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12);

    const sixMonthOrderPromise = orderModel.find({
      createdAt : {
        $gte : sixMonthAgo,
        $lte : today
      }
    }).select("createdAt");

    const sixMonthProductPromise = productModel.find({
      createdAt : {
        $gte : sixMonthAgo,
        $lte : today
      }
    }).select("createdAt");

    const sixMonthUserPromise = userModel.find({
      createdAt : {
        $gte : sixMonthAgo,
        $lte : today
      }
    }).select("createdAt");

    const twelveMonthOrderPromise = userModel.find({
      createdAt : {
        $gte : twelveMonthAgo,
        $lte : today
      }
    }).select("createdAt");

    const [order,product,user,order12] = await Promise.all([sixMonthOrderPromise,sixMonthProductPromise,sixMonthUserPromise,twelveMonthOrderPromise]);

    const monthlyOrderCount = new Array(6).fill(0);

    order.forEach(el=>{
      const createDate = el.createdAt;
      const monthDiff = ((today.getMonth() - createDate.getMonth()) + 12) % 12;

      if(monthDiff<6){
          monthlyOrderCount[6-monthDiff-1] += 1;
      }
    })


    const yearlyOrderCount = new Array(12).fill(0);

    order12.forEach(el=>{
      const createDate = el.createdAt;
      const monthDiff = ((today.getMonth() - createDate.getMonth()) + 12) % 12;

      if(monthDiff<12){
          yearlyOrderCount[12-monthDiff-1] += 1;
      }
    })

    const monthlyProductCount = new Array(6).fill(0);

    product.forEach(el=>{
      const createDate = el.createdAt;
      const monthDiff = ((today.getMonth() - createDate.getMonth()) + 12) % 12;

      if(monthDiff<6){
          monthlyProductCount[6-monthDiff-1] += 1;
      }
    })

    const monthlyUserCount = new Array(6).fill(0);

    user.forEach(el=>{
      const createDate = el.createdAt;
      const monthDiff = ((today.getMonth() - createDate.getMonth()) + 12) % 12;

      if(monthDiff<6){
          monthlyUserCount[6-monthDiff-1] += 1;
      }
    })

    return res.status(200).json({
      sucess : true,
      data : {
        orders : monthlyOrderCount,
        products : monthlyProductCount,
        user : monthlyUserCount,
        pastOrder : yearlyOrderCount               
      }
    })


  } catch (e) {
    next(e);
  }
};

const pieInfo = async (req, res, next) => {
  try {
    const [processed,shipped,delivered,category,productCount,outOfStock,allOrders,admin,customer,users] = await Promise.all([
      orderModel.countDocuments({status : "Processing"}),
      orderModel.countDocuments({status : "Shipped"}),
      orderModel.countDocuments({status : "Delivered"}),
      productModel.distinct("category"),
      productModel.countDocuments(),
      productModel.countDocuments({stock : 0}),
      orderModel.find({}).select(["tax","total","shipping"]),
      userModel.find({}).countDocuments({role : "admin"}),
      userModel.find({}).countDocuments({role : "user"}),
      userModel.find({}).select("dob")
    ]);


    const categoryCountPromise = category.map(el=> productModel.countDocuments({category : el}))
      const categoryCount = await Promise.all(categoryCountPromise);

      const categories = [];

      category.forEach((el,i)=>{
        categories.push({
            [el] : Number(((categoryCount[i] / productCount) * 100).toFixed(0))
        })
      })

    const orderRatio = {
      processed,
      shipped,
      delivered
    }

    const stockRatio = {
      inStock : productCount - outOfStock,
      outOfStock
    }

    const netRevenue = allOrders.reduce((acc,el)=>(acc += (el.total || 0)),0);

    const burnt = allOrders.reduce((acc,el)=>(acc += (el.tax || 0)),0);

    const expenditure = allOrders.reduce((acc,el)=>(acc += (el.shipping || 0)),0);

    const netIncome = netRevenue - (burnt + expenditure);


    const revenueDistribution = {
      netRevenue,
      netIncome,
      expenditure,
      burnt
    }

    const userRatio = {
      admin,
      customer
    }

    const ageGroup = {
      teen : users.filter(el => el.age < 20).length,
      adult : users.filter(el => el.age >= 20 && el.age<50).length,
      old : users.filter(el => el.age>= 50).length
    }

    return res.status(200).json({
      data : {
        orderRatio,
        stockRatio,
        userRatio,
        revenueDistribution,
        ageGroup,
        categoryPercent : categories
      },
      sucess : true
    })

  } catch (e) {
    next(e);
  }
};



module.exports = {
  dashboardInfo,
  barInfo,
  pieInfo
};
