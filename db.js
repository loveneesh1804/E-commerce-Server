const mongoose = require("mongoose");

const connection=(uri)=>{
    mongoose.connect(uri,{
        dbName : "Ecommerce"
    }).then(res=>console.log(`Connected to Database : ${res.connection.host}`))
    .catch(err=>console.log(err));
}

module.exports = connection;