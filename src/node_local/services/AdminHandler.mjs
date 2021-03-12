import express from "express";
var router = express.Router();

router.get("/identidad", function (req, res) {
    const ans = {
        "id": "id", 
        "roles": [], 
        "proveedor": "proveedor", 
        "sufijo": "sufijo", 
        "uid": "uid"
    };
    res.status(200).json(ans).end();
});

export default router;
