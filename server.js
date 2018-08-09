// Seriver js that works for the local hose
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.static('static_files'));

app.listen(port);