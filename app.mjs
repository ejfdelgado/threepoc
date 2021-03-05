"use strict";

import express from "express";
import utiles from "./src/node_local/services/UtilesSrv.mjs";

const app = express();

app.use("/", express.static("src"));
app.use("/api/utiles", utiles);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
  );
});
