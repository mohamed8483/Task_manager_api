const express = require("express");
const controller = require("../controllers/controller.products");
const route = express.Router();
route.get("/",controller.getallproduct);
route.get("/:id", controller.getproduct);
route.post("/", controller.createproduct);
route.put("/:id",controller.updataeproduct);
route.delete("/:id",controller.deleteproduct);
module.exports = route;

