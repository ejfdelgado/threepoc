import express from "express";
import { Utiles } from "../common/Utiles.mjs";
var router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log("Time: ", Utiles.getCurrentTimeNumber());
  next();
});

router.get("/", function (req, res) {
  res.status(200).send("Hello birds!").end();
});

router.get("/about", function (req, res) {
  res.send("About birds");
});

export default router;
