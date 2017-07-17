'use strict'

// private object
var Char = function (str) {
  this.rawChar = str
}

Char.prototype._defaultToKeyEvents = function () {
  return [{
    type: 'char',
    text: this.rawChar
  }]
}

Char.prototype.toKeyEvents = function () {
  return this._defaultToKeyEvents()
}

var Keyboard = function (str) {
  this.chars = []
  if (typeof str === 'string') {
    this.appendString(str)
  }
}

Keyboard.prototype.appendString = function (str) {
  for (const char of Array.from(str)) {
    this.chars.push(new Char(char))
  }
}

Keyboard.prototype.toKeyEvents = function (modifier) {
  return Array.prototype.concat.apply([], this.chars.map(function (char) {
    return char.toKeyEvents()
  }))
}

module.exports.Keyboard = Keyboard
