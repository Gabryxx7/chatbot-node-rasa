/**
 * Composes modules which provide Intent and Entity analysis capabilities, in this case Rasa NLU.
 */

// services
const rasa = require('./rasa/rasa.js');

exports.parse = parse;

function parse(message, callback) {
    console.log("Classifier Parse");
    rasa.parse(message, callback);
}
