/**
 * A wrapper over Rasa NLU's REST API. 
 */

const request = require('request');
const Entity = require('../entity.js');
const Intent = require('../intent.js');

const rasaModelName = 'my-model';

exports.parse = parse;

/**
 * Request Rasa NLU to parse a message. Results are provided via the callback.
 */
function parse(message, callback) {
    console.log("Rasa Parse, message: " +message);
    request(createParseRequest(rasaModelName, message), function(error, response, body) {
        console.log('rasa: response - ', response && response.statusCode);
        if (error) callback(error);
        if (body) callback(null, extractIntent(body), extractEntities(body));
    });
}

function extractIntent(body) {
    return body.intent ? new Intent(body.intent.name) : null;
}

function extractEntities(body) {
    var entities = [];
    if (body.entities) {        
        for (var i = 0; i < body.entities.length; i++) {
            var entity = new Entity(body.entities[i].entity, body.entities[i].value);
            entities.push(entity);
        }
    }
    return entities;
}

function createParseRequest(modelName, message) {
    return {
        method: 'POST',
        uri: 'http://localhost:3100/parse',
        json: true,
        body: {
            'model': modelName,
            'q': message
        }
    }
}