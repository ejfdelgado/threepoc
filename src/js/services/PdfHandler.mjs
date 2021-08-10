import jsPDF from "jspdf/dist/jspdf.node.min.js";
import express from "express";
import bodyParser from "body-parser";
import { jsPdfLocal } from "../common/jsPdf.mjs";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

export class PdfHandler {
  static async render(req, res) {
    const body = req.body;
    const doc = jsPdfLocal.process(jsPDF.jsPDF, body);
    const data = doc.output();
    res.write(data, "utf8", () => {
      res.end();
    });
  }
}

router.post("/render", PdfHandler.render);

export default router;
