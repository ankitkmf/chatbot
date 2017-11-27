'use strict';

const APIAI_TOKEN = "492a281b4eb64b8cbc326a5ac84d1cbe"; // "475db972aaf84669b935b8733a8a0f9a"; //process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = "sfdfd"; // process.env.APIAI_SESSION_ID;

const express = require('express');
const app = express();
const http = require('http'),
    https = require('https'),
    fs = require('fs');

app.use(express.static(__dirname + '/views')); // html
app.use(express.static(__dirname + '/public')); // js, css, images

const httpsOptions = {
    key: fs.readFileSync('./certs/privatekey.pem'),
    cert: fs.readFileSync('./certs/certificate.pem')
}

var server = https.createServer(httpsOptions, app).listen(2000, function() {
    console.log("Express server listening on port " + 2000);
});


// const server = app.listen(2000, () => {
//     console.log('server listening on port %d in %s mode', server.address().port, app.settings.env);
// });

const io = require('socket.io')(server);
io.on('connection', function(socket) {
    // console.log('a user connected');
});

const apiai = require('apiai')(APIAI_TOKEN);

// Web UI
app.get('/', (req, res) => {
    // res.sendFile('botui.html');
    res.sendFile(__dirname + '/views/botui.html');
});

app.get('/simple', (req, res) => {
    res.sendFile(__dirname + '/views/simple.html');
});

app.get('/bot', (req, res) => {
    res.sendFile(__dirname + '/views/botui.html');
});

io.on('connection', function(socket) {
    socket.on('chat message', (text) => {
        // console.log('Message: ' + text);

        // Get a reply from API.ai

        let apiaiReq = apiai.textRequest(text, {
            sessionId: APIAI_SESSION_ID
        });

        apiaiReq.on('response', (response) => {
            // console.log(JSON.stringify(response.result.fulfillment));
            let aiText = response.result.fulfillment.speech;
            //   console.log('Bot reply: ' + aiText);
            socket.emit('bot reply', response.result.fulfillment);
        });

        apiaiReq.on('error', (error) => {
            console.log(error);
        });

        apiaiReq.end();

    });
});