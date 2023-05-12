const express = require('express');
const http = require("http");

const router = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(router);

const PORT = process.env.PORT || 3000;
http
  .createServer(app)
  .listen(PORT, () => console.log('server started on port: ', PORT))


