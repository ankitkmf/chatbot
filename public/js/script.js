'use strict';

const socket = io();

//const outputYou = document.querySelector('.output-you');
//const outputBot = document.querySelector('.output-bot');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

document.querySelector('button').addEventListener('click', () => {
    $("button").addClass("speech");
    recognition.start();
});

recognition.addEventListener('speechstart', () => {
    //  console.log("2");
    //  console.log('Speech has been detected.');
});

recognition.addEventListener('result', (e) => {

    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;

    addYourMessage(text);

    socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
    recognition.stop();
});

recognition.addEventListener('error', (e) => {
    $("button").removeClass("speech");
    // outputBot.textContent = 'Error: ' + e.error;
});

function synthVoice(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    synth.speak(utterance);
}

socket.on('bot reply', function(replyText) {
    $("button").removeClass("speech");
    synthVoice(replyText);

    recognition.start();

    if (replyText == '') replyText = '(No answer...)';
    addAgentMessage(replyText);
    //outputBot.textContent = replyText;
});

function you(text) {
    //return "<p>You : <em class='output-you'>" + text + "</em></p>";
    return "<h4>You< : <em class='output-you'>" + text + "</em></p>";
}

function agent(text) {
    return "<p>agent : <em class='output-bot'>" + text + "</em></p>";
}

var addYourMessage = (text) => {
    $("#messages").append($("<li>").text(text));
    // var li = document.createElement("li");
    // li.appendChild(document.createTextNode(you(text)));
    // document.getElementById("messages").appendChild(li);
}

var addAgentMessage = (text) => {
    $("#messages").append($("<li>").text(text));
    // var li = document.createElement("li");
    // li.appendChild(document.createTextNode(agent(text)));
    // document.getElementById("messages").appendChild(li);
}