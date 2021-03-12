"use strict";

import express from "express";
import utiles from "./src/node_local/services/UtilesSrv.mjs";
import tuplaHandler from "./src/node_local/services/TuplaHandler.mjs";

const app = express();

app.use("/", express.static("src"));
app.use("/api/utiles", utiles);
app.use("/api/tup", tuplaHandler);


const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(
    `App listening on http://127.0.0.1:${PORT} Press Ctrl+C to quit.`
  );
});
