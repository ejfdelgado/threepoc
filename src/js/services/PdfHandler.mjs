import jsPDF from "jspdf";
import express from "express";
import bodyParser from "body-parser";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

export class PdfHandler {
  static async render(req, res) {
    const body = {
      elements: [
        {
          type: "img",
          data: "",
        }
      ]
    };
    const imgData = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
    const doc = new jsPDF.jsPDF();
    doc.text("SE VENDE", 10, 10);
    doc.addImage(imgData, 'JPEG', 15, 40, 180, 160);
    const data = doc.output();
    res.write(data, "utf8", () => {
      res.end();
    });
  }
}

router.get("/render", PdfHandler.render);

export default router;
