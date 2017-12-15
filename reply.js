module.exports = Reply;

function Reply(message, reply, intent, entities) {
    this.message = message;
    this.reply = reply;
    this.intent = intent;
    this.entities = entities;
}

Reply.prototype.toJson = function() {
    var json = {};
    json['intent'] = this.intent;
    json['entities'] = this.entities;
    json['reply'] = this.reply;
    json['message'] = this.message;
    return json;
}