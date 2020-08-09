const express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')

var app = express()


app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(cors())


const mp3 = require('./mp3');

app.use('/mp3', mp3);

let port = 3000;

app.listen(port, 'localhost', () => {
    console.log(`listening on port ${port}`);
})