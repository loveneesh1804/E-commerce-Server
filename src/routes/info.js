const express = require("express");
const admin = require("../middleware/auth");
const {dashboardInfo,pieInfo,barInfo} = require("../controller/info");

const infoRoute = express.Router();

// /api/info/
infoRoute.get("/dashboard",admin,dashboardInfo);

infoRoute.get("/pie",admin,pieInfo);

infoRoute.get("/bar",admin,barInfo);

module.exports = infoRoute;