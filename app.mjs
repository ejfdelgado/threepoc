"use strict";

import express from "express";
import utiles from "./src/js/services/UtilesSrv.mjs";
import tuplaHandler from "./src/js/services/TuplaHandler.mjs";
import adminHandler from "./src/js/services/AdminHandler.mjs";
import storageHandler from "./src/js/services/StorageHandler.mjs";
import mainHandler from "./src/js/services/MainHandler.mjs";
import shortUrlHandler from "./src/js/services/ShortUrlHandler.mjs";
import pageHandler from "./src/js/services/PageHandler.mjs";

const app = express();

app.use("/api/xpage", pageHandler)
app.use("/api/utiles", utiles);
app.use("/api/tup", tuplaHandler);
app.use("/adm", adminHandler);
app.use("/a", shortUrlHandler);
app.use("/storage", storageHandler);
app.use("/", mainHandler);

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(
    `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
  );
});

export default app;
