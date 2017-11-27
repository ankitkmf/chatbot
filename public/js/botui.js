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
        //  console.log("1");
        $("button").addClass("speech");
        recognition.start();
    });

    $("#chatMessage").on("click", ".requestLink", function() {
        console.log("test" + $(this).text());
        addYourMessage($(this).text());
        socket.emit('chat message', $(this).text());
    });

    $(".startChat").on("click", function() {
        console.log("1");
        $(".chat").show();
        $(".startChat").hide();
        var startText = "start";
        // addYourMessage(startText);
        socket.emit('chat message', startText);
    })

    recognition.addEventListener('speechstart', () => {
        //  console.log("2");
        //  console.log('Speech has been detected.');
    });

    recognition.addEventListener('result', (e) => {
        // console.log("3");
        //  console.log('Result has been detected.');

        let last = e.results.length - 1;
        let text = e.results[last][0].transcript;

        addYourMessage(text);
        //outputYou.textContent = text;
        //  console.log('Confidence: ' + e.results[0][0].confidence);

        socket.emit('chat message', text);
    });

    recognition.addEventListener('speechend', () => {
        //  console.log("4");
        recognition.stop();
    });

    recognition.addEventListener('error', (e) => {
        //  console.log("5");
        $("button").removeClass("speech");
        // outputBot.textContent = 'Error: ' + e.error;
    });

    function synthVoice(text) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        synth.speak(utterance);
    }

    socket.on('bot reply', function(fulfillment) {
        //  console.log("6");
        //  console.log("fulfillment:" + JSON.stringify(fulfillment));
        $("button").removeClass("speech");
        synthVoice(fulfillment.speech);

        // if (replyText == '') replyText = '(No answer...)';
        // addAgentMessage(fulfillment.speech);
        // addAgentMessage(fulfillment);
        validateMessage(fulfillment);
        //   addAgentImage(fulfillment.messages[1].imageUrl);
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
        $('<div class="message message-personal">' + text + '</div>').appendTo($('.mCSB_container')).addClass('new');
        updateScrollbar();
    }

    var validateMessage = (fulfillment) => {
        // console.log("1");
        if (fulfillment.messages.length > 0) {
            var html = '';
            // console.log("2");
            $.each(fulfillment.messages, function(index, value) {
                //  console.log("3");
                //  console.log(index + ": " + value.type);
                switch (value.type) {
                    case 0:
                        //    console.log("value.speech:" + value.speech);
                        html += addAgentMessage(value.speech);
                        break;
                    case 1:

                        break;
                    case 2:
                        //   console.log("value.replies:" + value.replies);
                        html += addAgentLinks(value.replies);
                        break;
                    case 3:
                        //   console.log("value.imageUrl:" + value.imageUrl);
                        html += addAgentImage(value.imageUrl);
                        break;
                }
            });

            $('<div class="message">' + html + '</div>').appendTo($('.mCSB_container')).addClass('new');
            updateScrollbar();
        }
    }

    var addAgentMessage = (fulfillment) => {
        // $('<div class="message new"><figure class="avatar"><span><i class="fa fa-android"></i></span></figure>' + fulfillment + '</div>').appendTo($('.mCSB_container')).addClass('new');
        return '<div><figure class="avatar"><span><i class="fa fa-android"></i></span></figure>' + fulfillment + '</div>';
        //   updateScrollbar();
    }

    var addAgentImage = (image) => {
        // $('<div class="message new"><img src=' + image + ' ></div>').appendTo($('.mCSB_container')).addClass('new');
        return '<img src=' + image + '>';
        // updateScrollbar();
    }

    var addAgentLinks = (replies) => {
        var allReplies = '';
        $.each(replies, function(index, value) {
            var query = value;
            console.log(value);
            // console.log("replies:" + value)
            allReplies += '</br><a class="link requestLink" data-id=' + query + '>' + query + '</a>';
            //allReplies += '<label data-id=' + value + ' class="link requestLink" ' > +value + '</label>';
            //  $('<div class="message new link"><a href=sendRequest(' + query + ') >' + query + '</a></div>').appendTo($('.mCSB_container')).addClass('new');
        });
        return allReplies;
        // updateScrollbar();
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