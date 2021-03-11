import express from "express";
var router = express.Router();

router.get("/fecha", function (req, res) {
    const ans = {}
    ans['error'] = 0
    ans['unixtime'] = new Date().getTime();
    res.status(200).json(ans).end();
});

export default router;
