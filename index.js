const express = require('express');

const app = express();

const HOST = 'http://localhost';
const PORT = '8081';
const SERVER = HOST + ':' + PORT + '/';

app.get('/', function (req, res) {
  // TODO
});

app.listen(PORT, function () {
  console.log('Server listening on: ' + SERVER);
});