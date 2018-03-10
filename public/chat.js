(function () {
    //This is the message object, which has some text, and a "side"
    var Message;
    var messageId = 0;
    var replyId = 0;
    var userPicId = (Math.round(Math.random()) + 1);
    var showHelpTooltip = true;
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
                var $message = $($('.message_template').clone().html()); //Create the new message starting from the template

                if (_this.sender === "bot") {
                    if (_this.originalMessage === "init") {
                        $message.find("#wrapper.feedback").text("");
                        $message.find("#wrapper.feedback").addClass("empty");   
                        //$message.prepend("<div id='dummy'> </div>");
                    } else if(_this.originalMessage == "writing"){
                        //$message.find("#wrapper.feedback").remove();
                        //$message.prepend("<div id='dummy'> </div>");
                        $message.find("#wrapper.feedback").text("");
                        $message.find("#wrapper.feedback").addClass("empty");
                        $message.addClass("writing");
                        $message.find(".message-time").hide();
                    }
                    else {
                        //Looking for the last element in the messages container with class left and writing
                        $lastWritingMessage =  $('.message.left.writing');
                        if(typeof $lastWritingMessage !== "undefined"){
                           /* console.log("Last writing message: " +$lastWritingMessage.attr("class"));
                            $message = $lastWritingMessage;
                            $message.find("#dummy").remove();
                            $message.prepend($('.message_template #wrapper.feedback').clone());
                            $message.find(".message-time").show();*/
                        }

                        $message.attr("replyId", replyId++);
                        $message.find(".intent-info").find(".intent").text(_this.intent);
                        $message.find(".intent-info").find("#question p").text("Did I understand correctly?");
                        //console.log("It is not an init message");
                        if(!$(".js-help-switch").is(":visible") && showHelpTooltip) {
                            //console.log("Toggle wasn't visible, fading in");
                            $("#help-toggle").fadeIn(200, function(){
                                $("#help-toggle .toggle-tooltip").fadeIn(200);
                            });
                        }
                    }
                } else {
                    //$message.find("#wrapper.feedback").remove();
                    $message.attr("messageId", messageId++);
                }

                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $message.find(".avatar").attr('class', 'transparent avatar'); //I want the avatar to be transparent
                //I am getting the class of the last message received, if it's NOT on the same side as the one I want to append
                //I want to show the avatar and also the message tick
                //the avatar is already transparent so if I want to show the bot pic or the user pic I just append the img element
                $lastMessage = $('.messages li:last-child').last();
                if (!$lastMessage.hasClass(_this.message_side)) {
                    var userPicString = _this.message_side == "left" ? "bot_pic.png" :  "user" + userPicId + ".svg";
                    $message.find(".avatar").append("<img class='avatarPic' src='" +userPicString +"'>");
                } else {
                    if($lastMessage.hasClass("writing")){
                        $lastMessage.removeClass("writing");
                    }
                    else{
                        //if we are still on the same side I want to remove the tick and I also avoid appending the user or bot pic
                        $message.find(".text_wrapper").addClass("no-tick");
                        $message.find("#wrapper.feedback").addClass("no-tick");
                    }
                }
                var date = new Date();
                $message.find(".message-time").text(moment().format('HH:mm'));
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
            if (messageText === '') {
                return;
            }
            $('.message_input').val('');
            console.log("sending message " + messageText);
            socket.emit(messageChannel, messageText, true, function(message){
                console.log("Error: " +message);
                //appendMessage("<div class='ball-beat'><div></div><div></div><div></div></div>", "bot", "intent_name", "writing");
                //<div class="ball-beat"><div></div><div data-dynamite-selected="true"></div><div></div></div>
            });
            appendMessage(messageText, "user", "");
        };

        appendMessage = function (text, from, intentTxt, originalMessage) {
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


        var helpSwitch = document.querySelector('.js-help-switch');
        var init = new Switchery(helpSwitch);
        init.setPosition(true);

        var themeSwitch = document.querySelector('.js-theme-switch');
        var init2 = new Switchery(themeSwitch,  {jackSecondaryColor: '#b1e0f9', secondaryColor: '#fdd5a9', jackColor: '#ded9d9', color: '#5773ff'});
        init2.setPosition(true);

        helpSwitch.addEventListener('click',function () {
            console.log("Feedback toggle");
            $('#help-toggle .toggle-tooltip').fadeOut();
            showHelpTooltip = false;
            $(".feedback").each(function () {
                var feedbackMessage = $(this);
                if(!helpSwitch.checked){
                    //If the switch has been set to off we want to fade out the message
                    //and only then we can hide the content and reduce the width to slide everything into position
                    feedbackMessage.not(".empty").not("#sent").animate({opacity: 0}, 50, function(){
                        feedbackMessage.find(".intent-info").hide(0);
                        //feedbackMessage.find(".intent").hide(0);
                        feedbackMessage.animate({width: 0}, 150);  
                    });  

                    feedbackMessage.not(".empty").filter("#sent").animate({opacity: 0}, 50, function(){
                        feedbackMessage.find(".intent-info").hide(0);
                        feedbackMessage.find(".intent").hide(0);
                        feedbackMessage.animate({width: 15}, 150);  
                    });  

                    //since the empty messages don't animate the opacity, bu they also hide the content (if any) and reduce the size
                    //we set a timeout which starts exactly after the animation for the non-empty elements and does the same thing
                    setTimeout(function(){
                        feedbackMessage.filter(".empty").find(".intent-info").hide(0);
                        feedbackMessage.filter(".empty").animate({width: 0}, 150);  
                    }, 50);
                }
                else{
                    //If instead the switch has been set to off we want to first slide everything into the new position
                    //so we first animate the width, then we can show the content and finally we fadeIn the message bubble
                    feedbackMessage.not("#sent").animate({width: 250}, 150, function(){
                        feedbackMessage.find(".intent-info").show(0);
                        feedbackMessage.not(".empty").animate({opacity: 1}, 200);
                    });

                    feedbackMessage.filter("#sent").animate({width: 250}, 150, function(){
                        feedbackMessage.find(".intent").show(0);
                        feedbackMessage.not(".empty").animate({opacity: 1}, 200);
                    });
                }
            });
        });

        themeSwitch.addEventListener('click', function () {
            var messagesContainer = $(".messages");
            if(messagesContainer.hasClass("theme1")){
                console.log("Has theme1, switching to theme2");
                messagesContainer.removeClass("theme1").addClass("theme2");
            }
            else if(messagesContainer.hasClass("theme2")){
                console.log("Has theme2, switching to theme1");
                messagesContainer.removeClass("theme2").addClass("theme1");
            }
        });

        //Note: the .click() or .on('click') function DOES NOT WORK
        //When an element is dynamically inserted into the DOM, this is because the event handler
        //is attached right after the DOM is completely loaded, so if I add elements after the DOM has been loaded
        //the elements won't have any event handler attached (e.g the click callback won't work)
        //In order to fix this, I attach a click event on the general container, in this case it is the div with class "messages"
        //then I add another filter on the specific object that has been clicked, in this case is the span with class "feedback_yes"
        $('.messages').on('click', "span.feedback_yes", function () {
            var intent = $(this).parent().parent().find(".intent").text(); //From the yes button I am climbing up the DOM until I am in the form with class "feedback" which contains the a element with the class "intent"
            var $message = $(this).parent().parent().parent().parent().parent();
            var replyId = $message.attr("replyId"); //I am climbing up until  I get to the div of the message, with class "message" which has an attribute "replyId"
            //Here I am climbing up until the general container of the messages, from here I have the list of all the messages and I am looking for the one with messageId == replyId, and then I am getting its text
            var message = $(this).parent().parent().parent().parent().parent().parent().find(".message[messageId='" + replyId + "']").find(".text").text();
            console.log("YES! ID: " + replyId + " | message: " + message + " | intent: " + intent);
            var wrapper = $(this).parent().parent().parent().parent();
            var wrapperParent = $(this).parent().parent().parent().parent().parent();
            var check = $('#checkTemplate #checkYes').clone().html();
            var $messages = $message.parent();
            /*$messages.animate({
                scrollTop: $message.prop('scrollHeight')
            }, 100);*/
            wrapper.animate({ opacity: 0  }, 200, function () {
                $(this).remove();
                var newEl = $("<div class='feedback' id='sent'> <a class='intent'>" + intent + "</a> " + check + "</div>");
                newEl.css('opacity', 0);
                newEl.css('width', 250);
                newEl.prependTo(wrapperParent).animate({opacity: 1}, 500);
            });
            socket.emit(replyChannel, message, intent, true);
        });

        $('.messages').on('click', "span.feedback_no", function () {
            var intent = $(this).parent().parent().find(".intent").text(); //From the yes button I am climbing up the DOM until I am in the form with class "feedback" which contains the a element with the class "intent"
            var $message = $(this).parent().parent().parent().parent().parent();
            var replyId = $message.attr("replyId"); //I am climbing up until  I get to the div of the message, with class "message" which has an attribute "replyId"
            //Here I am climbing up until the general container of the messages, from here I have the list of all the messages and I am looking for the one with messageId == replyId, and then I am getting its text
            var message = $(this).parent().parent().parent().parent().parent().parent().find(".message[messageId='" + replyId + "']").find(".text").text();
            console.log("NO! ID: " + replyId + " | message: " + message + " | intent: " + intent);
            var wrapper = $(this).parent().parent().parent().parent();
            var wrapperParent = $(this).parent().parent().parent().parent().parent();
            var check = $('#checkTemplate #checkNo').clone().html();
            var $messages = $message.parent();
            /*$messages.animate({
                scrollTop: $message.prop('scrollHeight')
            }, 100);*/
            wrapper.animate({  opacity: 0 }, 200, function () {
                $(this).remove();
                var newEl = $("<div class='feedback' id='sent'> <a class='intent'>" + intent + "</a> " + check + "</div>");
                newEl.css('opacity', 0);
                newEl.css('width', 250);
                newEl.prependTo(wrapperParent).animate({opacity: 1}, 500);
            });
            socket.emit(replyChannel, message, intent, false);
        });

        $('#help-toggle .toggle-tooltip .close').on('click', function() {
            $('#help-toggle .toggle-tooltip').fadeOut(150);
            showHelpTooltip = false;
            event.preventDefault();
        })

        $('#help-toggle .toggle-tooltip').on('click', function() {
            event.preventDefault();
        })
    });

}.call(this));