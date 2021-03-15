"use strict";

import express from "express";
import utiles from "./src/js/services/UtilesSrv.mjs";
import tuplaHandler from "./src/js/services/TuplaHandler.mjs";
import adminHandler from "./src/js/services/AdminHandler.mjs";
import storageHandler from "./src/js/services/StorageHandler.mjs";

const app = express();

app.use("/", express.static("src"));
app.use("/api/utiles", utiles);
app.use("/api/tup", tuplaHandler);
app.use("/adm", adminHandler);
app.use("/storage", storageHandler);

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(
    `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
  );
});

export default app;
