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

router.get("/fecha", function (req, res) {
  const ans = {};
  ans["error"] = 0;
  ans["unixtime"] = new Date().getTime();
  res.status(200).json(ans).end();
});

export default router;
