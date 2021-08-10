"use strict";

import express from "express";
import utiles from "./src/js/services/UtilesSrv.mjs";
import tuplaHandler from "./src/js/services/TuplaHandler.mjs";
import adminHandler from "./src/js/services/AdminHandler.mjs";
import storageHandler from "./src/js/services/StorageHandler.mjs";
import mainHandler from "./src/js/services/MainHandler.mjs";
import shortUrlHandler from "./src/js/services/ShortUrlHandler.mjs";
import pageHandler from "./src/js/services/PageHandler.mjs";
import emailHandler from "./src/js/services/EmailHandler.mjs";
import { Usuario } from "./src/js/services/Usuario.mjs";
import cookieStoreHandler from "./src/js/services/CookieStoreHandler.mjs";
import pdfHandler from "./src/js/services/PdfHandler.mjs";

const app = express();

app.use("/api/xpage", Usuario.authDecorator, pageHandler);
app.use("/api/utiles", utiles);
app.use("/api/tup", Usuario.authDecorator, tuplaHandler);
app.use("/api/cookie", cookieStoreHandler);
app.use("/api/pdf", pdfHandler);
app.use("/adm", adminHandler);
app.use("/a", shortUrlHandler);
app.use("/storage", Usuario.authDecorator, storageHandler);
app.use("/mail", emailHandler);
app.use("/", mainHandler);

app.use((error, req, res, next) => {
  return res.status(500).json({ error: error.toString() });
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(
    `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
  );
});

export default app;
