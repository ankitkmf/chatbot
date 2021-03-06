'use strict';

const APIAI_TOKEN = "492a281b4eb64b8cbc326a5ac84d1cbe";
const APIAI_SESSION_ID = "test";
const express = require('express');
const app = express();
const http = require('http'),
    https = require('https'),
    fs = require('fs');

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

const httpsOptions = {
    key: fs.readFileSync('./certs/privatekey.pem'),
    cert: fs.readFileSync('./certs/certificate.pem')
}

var server = https.createServer(httpsOptions, app).listen(2000, function() {
    console.log("Express server listening on port " + 2000);
});

const io = require('socket.io')(server);
io.on('connection', function(socket) {
    // console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket) {
    socket.on('chat message', (text) => {

        let apiaiReq = apiai.textRequest(text, {
            sessionId: APIAI_SESSION_ID
        });

        apiaiReq.on('response', (response) => {
            let aiText = response.result.fulfillment.speech;
            socket.emit('bot reply', response.result.fulfillment);
        });

        apiaiReq.on('error', (error) => {
            console.log(error);
        });
        apiaiReq.end();
    });
});