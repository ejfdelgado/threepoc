'use strict';

const express = require('express');

const app = express();

app.get('/api', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

app.use('/', express.static('src'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on http://127.0.0.1:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
