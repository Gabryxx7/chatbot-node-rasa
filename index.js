// default replies
const REPLY_ERROR = "An error has occured. Please try again.";
const REPLY_DID_NOT_UNDERSTAND = "I didn't understand that. Can you rephrase?";
const REPLY_SUCCESSFUL = "I understood your message. You can tailor my responses to your messages by analysing the metadata attached with this message.";
//services
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const classifier = require('./nlu/classifier.js');


// models
const Reply = require('./reply.js');


// socket.io channels 
const messageChannel = 'message';
const replyChannel = 'reply';

app.use('/', express.static(path.join(__dirname + '/public')));
/*app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});*/

io.on('connection', function (socket) {
  console.log("User connected to Chatbot");
  socket.emit(replyChannel, new Reply("init", "Hello there!", JSON.parse('{"name": "greet"}'), "").toJson());
  socket.emit(replyChannel, new Reply("init", "I am the BIRD chatbot! I am still in development and I don't know much... But feel free to ask me something (please don't insult me!)", JSON.parse('{"name": "greet"}'), "").toJson());
  socket.on(messageChannel, function (message, isUser) {
    console.log("Chatbot received a message saying: ", message);
      sendToBot(message, socket);
  });

  socket.on(replyChannel, function(message, intent, feedback){
    console.log("Message: " + message +" | Intent: " +intent +" | Feedback: " + feedback);
  });
});

var port = 80;
server.listen(port, function () {
  console.log('Chatbot is listening on port ' + port + '!')
});

sendToBot = function(message, socket){  
  classifier.parse(message, function (error, intent, entities) {
    if (error) {
      socket.emit(replyChannel, "An error has occurred: " + error);
    } else {
      var reply = getReply(intent);
      socket.emit(replyChannel, new Reply(message, reply, intent, entities).toJson());
    }
  });
}

getReply = function(intent){
  if(!intent){
    return REPLY_DID_NOT_UNDERSTAND;
  }
  else{
    switch(intent.name){
      case "affirm": return "Ook :)";
      case "greet":  return  "Hello there!";
      case "restaurant_search":  return  "There are some nice restaurants around here!";
      case "goodbye": return "Pleasure talking to you. Goodbye!";
      case "variable_search":{
        if(entities["search_term"] === "accrued interest"){
          return "The amount of accrued interest on loans at the reporting reference date as defined in Regulation (EU) No 1071/2013 (ECB/2013/33). In accordance with the general principle of accruals accounting, interest receivable on instruments should be subject to on-balance sheet recording as it accrues (i.e. on an accruals basis) rather than when it is actually received (i.e. on a cash basis).";
        }
      }
      default: return "Sorry, I did not understand your input. Please try again.";
    }
  }  
}