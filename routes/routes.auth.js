const express = require("express");
const authcontroller = require('../controllers/controller.auth');
const route = express.Router();

route.post('/register',authcontroller.postcontrollerauth);
route.post('/login',authcontroller.postcontrollerlogin);
module.exports=route;
