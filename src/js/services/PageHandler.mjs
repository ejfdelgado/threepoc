import express from "express";
const router = express.Router();
export class PageHandler {
  //GET
  /**
     * {
        "error":0,
        "valor":{
            "act":1602162437.9051368,
            "aut":"google.com/edgar.jose.fernando.delgado@gmail.com",
            "date":1602162437.905136,
            "desc":"Descripci\u00f3n",
            "id":5732110983757824,
            "img":"",
            "kw":"",
            "path":"/1/scan3d",
            "q":null,
            "tit":"T\u00edtulo",
            "usr":"HHN9uJFCjeVEOitjp8BCpJ4A9KI3"
        }
    }
     * @param req 
     * @param res 
     */
  static async base(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
  //GET
  static async q2(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
  //GET
  static async q(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
  //PUT
  static async guardar(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
  //DELETE
  static async borrar(req, res) {
    const ans = { ok: true };
    res.status(200).json(ans).end();
  }
}

router.get("/q2/*", PageHandler.q);
router.get("/q/*", PageHandler.q);
router.get("/*", PageHandler.q);
router.put("/*", PageHandler.guardar);
router.delete("/*", PageHandler.borrar);

export default router;
