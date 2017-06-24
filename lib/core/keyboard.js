'use strict';

// private object
var Char = function(str) {
    this.rawChar = str;
};

Char.prototype.toKeyEvent = function() {
    var keyEvent = {};
    keyEvent['type'] = 'char';
    keyEvent['text'] = this.rawChar;

    return keyEvent;
};



var Keyboard = function(str) {
    this.chars = [];
    if (typeof str === 'string') {
        this.appendString(str);
    }
};

Keyboard.prototype.appendString = function(str) {
    for (const char of Array.from(str)) {
        this.chars.push(new Char(char));
    }
};

Keyboard.prototype.toKeyEvents = function(modifier) {
    return this.chars.map(function(char) {
        return char.toKeyEvent();
    });
};

module.exports.Keyboard = Keyboard;
