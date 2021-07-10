import sgMail from "@sendgrid/mail";
import express from "express";
import bodyParser from "body-parser";
import { Constants } from "../common/Constants.mjs";
import { MainHandler } from "./MainHandler.mjs";
import { Utilidades } from "../common/Utilidades.mjs";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

export class EmailHandler {
  static async send(req, res) {
    sgMail.setApiKey(
      process.env.SEND_GRID_VARIABLE
    );
    const body = req.body;
    try {
      const contenido = await MainHandler.resolveLocalFile({
        files: [body.template],
      });
      const contenidoFinal = Utilidades.interpolate(
        contenido.data,
        body.params
      );

      const msg = {
        to: body.to,
        from: Constants.EMAIL_SENDER,
        subject: body.subject,
        html: contenidoFinal,
      };
      const answer = await sgMail.send(msg);
      res.status(200).json(answer).end();
    } catch (e) {
      res.status(500).json(e).end();
    }
  }
}

router.post("/send", EmailHandler.send);

export default router;
