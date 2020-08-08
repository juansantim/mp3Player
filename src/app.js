const express = require('express')
var app = express()

const mp3 = require('./mp3');

app.use('/mp3', mp3);

let port = 3000;

app.listen(port, 'localhost', () => {
    console.log(`listening on port ${port}`);
})