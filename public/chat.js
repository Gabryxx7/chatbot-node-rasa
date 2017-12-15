(function () {
    //This is the message object, which has some text, and a "side"
    var Message;
    var messageId = 0;
    var replyId = 0;
    Message = function (arg) {
        this.text = arg.text;
        this.message_side = arg.message_side;
        this.intent = arg.intent;
        this.sender = arg.sender;
        this.originalMessage = arg.originalMessage;
        //The draw function takes the message_template, which is a hidden html element and clones it
        //then it adds the ".text" class to mark that it has text, and insert the message text in it
        //Finally it appends the newly cloned element in the "messages" div containing all the messages
        //and add an animation, which is completed by adding the "appeared" class to the element
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                if(_this.sender === "bot"){
                    $message.find(".intent-info").find(".intent").text(_this.intent);
                    if(_this.originalMessage === "init"){
                        $message.find(".feedback#wrapper").remove();
                        $message.prepend("<div id='dummy'> </div>");
                    }
                    else{
                        $message.attr("replyId", replyId++);
                    }
                }
                else{
                    $message.find(".feedback#wrapper").remove();
                    $message.attr("messageId", messageId++);
                }
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                if(_this.message_side == "left"){
                    $message.find(".avatar").append("<img class='avatarPic' src='bot_pic.png'>");
                    $message.find(".avatar").attr('class', 'transparent avatar');
                }
                var date = new Date();
                $message.find(".message-time").append(moment().format('HH:mm'));
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };

    $(function () {
        var getMessageText, message_side, sendMessage;
        var message_side = 'right';
        const messageChannel = 'message';
        const replyChannel = 'reply';
        var socket = io();

        socket.on(replyChannel, function (jsonObj) {
            console.log("Received a reply from bot: ");
            console.log(jsonObj);
            appendMessage(jsonObj.reply, "bot", jsonObj.intent.name, jsonObj.message);
        });

        socket.on(messageChannel, function (msg, isUser) {
            console.log("Received a message: " + msg);
            appendMessage(text, "user", "");
        });


        sendMessage = function (text) {
            var message_input = $('.message_input');
            var messageText = message_input.val().trim();
            if(messageText === ''){
                return;
            }
            $('.message_input').val('');
            console.log("sending message " + messageText);
            socket.emit(messageChannel, messageText, true);
            appendMessage(messageText, "user", "");
        };

        appendMessage = function(text, from, intentTxt, originalMessage) {
            //IF the message is empty, do nothing
            if (text.trim() === '') {
                return;
            }

            var $messages, message;
            
            $messages = $('.messages');
            //IF the message is from the bot, then the bubble should be on the left
            //Otherwise if the message is from the user, it should be on the right
            message_side = from === 'bot' ? 'left' : 'right';

            //Let's create the new message object, with its text and its side and then draw it
            message = new Message({
                text: text,
                message_side: message_side,
                intent: intentTxt,
                sender: from,
                originalMessage: originalMessage
            });
            message.draw();

            //We animate the message box to scroll down by the height of the message, to show it all
            return $messages.animate({
                scrollTop: $messages.prop('scrollHeight')
            }, 100);
        }

        $('.send_message').click(function (e) {
            return sendMessage();
        });
        
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage();
            }
        });
        /*
        sendMessage('Hello Philip! :)');
        setTimeout(function () {
            return sendMessage('Hi Sandy! How are you?');
        }, 1000);
        return setTimeout(function () {
            return sendMessage('I\'m fine, thank you!');
        }, 2000);*/

        
      var elem = document.querySelector('.js-switch');
      var init = new Switchery(elem);
      init.setPosition(true);
      console.log(init)
      $('.switchery').click(function () {
        $(".feedback").each(function () {
            if($(this).css('opacity') == 0){
                $(this).animate({ opacity: 1 }, 200)
            }
            else{
                $(this).animate({ opacity: 0 }, 200)
            }
            /*if ( $(this).css('opacity') == '0' )
              $(this).css('opacity','1');
            else
              $(this).css('opacity','0');*/
        });
      });

    //Note: the .click() or .on('click') function DOES NOT WORK
    //When an element is dynamically inserted into the DOM, this is because the event handler
    //is attached right after the DOM is completely loaded, so if I add elements after the DOM has been loaded
    //the elements won't have any event handler attached (e.g the click callback won't work)
    //In order to fix this, I attach a click event on the general container, in this case it is the div with class "messages"
    //then I add another filter on the specific object that has been clicked, in this case is the span with class "feedback_yes"
      $('.messages').on('click', "span.feedback_yes", function() {
        var intent = $(this).parent().parent().find(".intent").text(); //From the yes button I am climbing up the DOM until I am in the form with class "feedback" which contains the a element with the class "intent"
        var replyId = $(this).parent().parent().parent().parent().parent().attr("replyId"); //I am climbing up until  I get to the div of the message, with class "message" which has an attribute "replyId"
        //Here I am climbing up until the general container of the messages, from here I have the list of all the messages and I am looking for the one with messageId == replyId, and then I am getting its text
        var message = $(this).parent().parent().parent().parent().parent().parent().find(".message[messageId='" + replyId + "']").find(".text").text();
        console.log("YES! ID: " + replyId +" | message: " +message +" | intent: " +intent);
        var wrapper = $(this).parent().parent().parent().parent();
        var wrapperParent = $(this).parent().parent().parent().parent().parent();
        var check = $('#checkTemplate #checkYes').clone().html();
        wrapper.animate({ opacity: 0 }, 200, function() {
            $(this).remove();
            var newEl = $("<div class='feedback' id='sent'> <a class='intent'>" +intent +"</a> " + check +"</div>");
            newEl.css('opacity', 0);
            newEl.prependTo(wrapperParent);
            newEl.prependTo(wrapperParent).animate({ opacity: 1 }, 500);
        });
        socket.emit(replyChannel, message, intent, true);
    });

    $('.messages').on('click', "span.feedback_no", function() {
            var intent = $(this).parent().parent().find(".intent").text(); //From the yes button I am climbing up the DOM until I am in the form with class "feedback" which contains the a element with the class "intent"
            var replyId = $(this).parent().parent().parent().parent().parent().attr("replyId"); //I am climbing up until  I get to the div of the message, with class "message" which has an attribute "replyId"
            //Here I am climbing up until the general container of the messages, from here I have the list of all the messages and I am looking for the one with messageId == replyId, and then I am getting its text
            var message = $(this).parent().parent().parent().parent().parent().parent().find(".message[messageId='" + replyId + "']").find(".text").text();
            console.log("NO! ID: " + replyId +" | message: " +message +" | intent: " +intent);
            var wrapper = $(this).parent().parent().parent().parent();
            var wrapperParent = $(this).parent().parent().parent().parent().parent();
            var check = $('#checkTemplate #checkNo').clone().html();
            wrapper.animate({ opacity: 0 }, 200, function() {
                $(this).remove();
                var newEl = $("<div class='feedback' id='sent'> <a class='intent'>" +intent +"</a> " +check +"</div>");
                newEl.css('opacity', 0);
                newEl.prependTo(wrapperParent).animate({ opacity: 1 }, 500);
            });
            socket.emit(replyChannel, message, intent, false);
        });
    });
    
}.call(this));
