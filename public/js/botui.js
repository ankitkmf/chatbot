'use strict';

const socket = io();
var d, h, m, i = 0;

$(document).ready(function() {
    $("#chatMessage").mCustomScrollbar({
        theme: "dark-3"
    });
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    document.querySelector('button').addEventListener('click', () => {
        $("button").addClass("speech");
        recognition.start();
    });

    $('.enterChat').on('keydown', function(e) {
        if (e.which == 13 && $(this).val() != '') {
            e.preventDefault();
            var text = $(this).val();
            addYourMessage(text);
            socket.emit('chat message', text);
            $(this).val('');
        }
    });

    $("#chatMessage").on("click", ".requestLink", function() {
        addYourMessage($(this).text());
        socket.emit('chat message', $(this).text());
    });

    $(".startChat").on("click", function() {
        $(".chat").show();
        $(".startChat").hide();
        var startText = "start";
        socket.emit('chat message', startText);
    })

    recognition.addEventListener('speechstart', () => {
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
    });

    function synthVoice(text) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        synth.speak(utterance);
    }

    socket.on('bot reply', function(fulfillment) {
        $("button").removeClass("speech");
        synthVoice(fulfillment.speech);
        validateMessage(fulfillment);
    });

    function you(text) {
        return "<h4>You< : <em class='output-you'>" + text + "</em></p>";
    }

    function agent(text) {
        return "<p>agent : <em class='output-bot'>" + text + "</em></p>";
    }

    var addYourMessage = (text) => {
        updateScrollbar();
        $('<div class="message message-personal">' + text + '</div>').appendTo($('.mCSB_container')).addClass('new');
        updateScrollbar();
    }

    var validateMessage = (fulfillment) => {
        updateScrollbar();
        if (fulfillment.messages.length > 0) {
            var html = '';
            $.each(fulfillment.messages, function(index, value) {
                switch (value.type) {
                    case 0:
                        html += addAgentMessage(value.speech);
                        break;
                    case 1:
                        break;
                    case 2:
                        html += addAgentLinks(value.replies);
                        break;
                    case 3:
                        html += addAgentImage(value.imageUrl);
                        break;
                }
            });

            $('<div class="message">' + html + '</div>').appendTo($('.mCSB_container')).addClass('new');
            updateScrollbar();
        }
    }

    var addAgentMessage = (fulfillment) => {
        return '<div class="text"><figure class="avatar"><span><i class="fa fa-android"></i></span></figure>' + fulfillment + '</div>';
        updateScrollbar();
    }

    var addAgentImage = (image) => {
        return '<img src=' + image + '>';
        updateScrollbar();
    }

    var addAgentLinks = (replies) => {
        var allReplies = '';
        $.each(replies, function(index, value) {
            var query = value;
            allReplies += '</br><span class="badge badge-success"><a class="link requestLink" data-id=' + query + '>' + query + '</a></span>';
        });
        updateScrollbar();
        return allReplies;
    }

    function updateScrollbar() {
        $("#chatMessage").mCustomScrollbar("scrollTo", "bottom");
    }

    function setDate() {
        d = new Date()
        if (m != d.getMinutes()) {
            m = d.getMinutes();
            $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
        }
    }
});