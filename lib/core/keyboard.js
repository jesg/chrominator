'use strict'

const systemKeys = {
  '\n': {
    text: '\r',
    identifier: 'Enter'
  },
  '\r': {
    text: '\r',
    identifier: 'Enter'
  },
  '\b': {
    text: '\b',
    identifier: 'Backspace'
  },
  '\t': {
    text: '\t',
    identifier: 'Tab'
  }
}

// private object
var Char = function (str) {
  this.rawChar = str
}

Char.prototype.isSystemKey = function () {
  return this.rawChar in systemKeys
}

Char.prototype._systemToKeyEvents = function () {
  const key = systemKeys[this.rawChar]
  return [{
    type: 'rawKeyDown',
    text: key.text,
    unmodifiedText: key.text,
    keyIdentifier: key.identifier
  }, {
    type: 'char',
    text: key.text
  }]
}

Char.prototype._defaultToKeyEvents = function () {
  return [{
    type: 'char',
    text: this.rawChar
  }]
}

Char.prototype.toKeyEvents = function () {
  if (this.isSystemKey()) {
    return this._systemToKeyEvents()
  } else {
    return this._defaultToKeyEvents()
  }
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
