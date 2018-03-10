
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
  socket.emit(replyChannel, new Reply("init", JSON.parse('{"name": "init1"}'), "").toJson());
  socket.emit(replyChannel, new Reply("init", JSON.parse('{"name": "init2"}'), "").toJson());
  socket.on(messageChannel, function (message, isUser, fn) {
    
    /*setTimeout(function(){
      fn('Message arrived to the server'); //callback function
    }, 5000);
      console.log("Chatbot received a message saying: ", message);
      setTimeout(function(){
        sendToBot(message, socket);
      }, 10000);*/
      
      fn('Message arrived to the server'); //callback function
      sendToBot(message, socket);
      
  });

  socket.on(replyChannel, function(message, intent, feedback){
    console.log("Message: " + message +" | Intent: " +intent +" | Feedback: " + feedback);
  });
});

var port = 8000;
server.listen(port, function () {
  console.log('Chatbot is listening on port ' + port + '!')
});

sendToBot = function(message, socket){  
  classifier.parse(message, function (error, intent, entities) {
    if (error) {
      socket.emit(replyChannel, "An error has occurred: " + error);
    } else {
      socket.emit(replyChannel, new Reply(message, intent, entities).toJson());
    }
  });
}
