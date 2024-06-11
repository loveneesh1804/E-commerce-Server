const express = require("express");
const userRoute = require("./src/routes/user");
const connection = require("./db");
const errorMiddleware = require("./src/middleware/error");
const productRoute = require("./src/routes/product");
const orderRoute = require("./src/routes/order");
const paymentRoute = require("./src/routes/payment");
const infoRoute = require("./src/routes/info");
const reviewRoute = require('./src/routes/review');
const app = express();
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT_NO || 8080;

app.use(cors({
    origin: "http://localhost:3000",
    headers: ["Content-Type"],
    credentials: true,
}));
app.use(helmet());
app.use(express.json());
connection(process.env.DB_CONNECT);

app.use("/api/user",userRoute);
app.use("/api/product",productRoute);
app.use("/api/order",orderRoute);
app.use("/api/payment",paymentRoute);
app.use("/api/info",infoRoute);
app.use("/api/review",reviewRoute);

app.use("/uploads",express.static("uploads"));
app.use(errorMiddleware);


app.listen(port,()=>{
    console.log(`http://localhost:${port}/`)
})

