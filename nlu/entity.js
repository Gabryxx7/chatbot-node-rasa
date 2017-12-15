/**
 * A model representing an Entity. Entities represent actionable data present in a message received by the Chatbot. 
 */

module.exports = Entity;

function Entity(type, value) {
    this.type = type;
    this.value = value;
}