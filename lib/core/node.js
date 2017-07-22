'use strict'

var Keyboard = require('./keyboard').Keyboard
const debug = require('debug')('chrominator.node')

/**
* Abstract DOM Element
* @module Node
*/

/**
 * @constructor
 * @param {Driver} driver
 * @param {string} nodeId - The nodes node id
 */
var Node = function (driver, nodeId) {
  this.driver = driver
  this.crd = this.driver.crd
  this.nodeId = nodeId
  this.DOM = this.crd.DOM
  this.Input = this.crd.Input
  this.Runtime = this.crd.Runtime
  this.objectGroup = 'global'
}

/**
 * Add the remote object id to the Node
 *
 * @private
 */
Node.prototype.init = function () {
  debug('init')
  const self = this
  return self.toRemoteObject().then((result) => {
    Object.defineProperty(self, 'objectId', {
      value: result.object.objectId,
      writable: false
    })
    return self
  })
}

// raw get attributes
Node.prototype._getAttributes = function () {
  return this.DOM.getAttributes({nodeId: this.nodeId})
}

/**
 * Get the Node's attributes.
 *
 * @example
 * attributes = await node.getAttributes()
 *
 * @return {Object} The attributes as key-value pairs.
 *
 */
Node.prototype.getAttributes = function () {
  return this._getAttributes().then((result) => {
    const attrs = result['attributes']
    const len = attrs.length
    const data = {}

    for (var i = 0; i < len; i++) {
      data[attrs[i]] = attrs[++i]
    }
    return data
  })
}

/**
 * Get an attribute on the node.
 *
 * @example
 * value = await node.getAttribute('class')
 *
 * @param {string} name - attribute name
 * @return {(string|null)} attribute value or null if the attribute does not exist
 *
 */
Node.prototype.getAttribute = function (name) {
  return this._getAttributes().then((result) => {
    const attrs = result['attributes']
    const len = attrs.length

    for (var i = 0; i < len; i++) {
      if (attrs[i] === name) {
        return attrs[i + 1]
      }
    }
    return null
  })
}

/**
 * Search for a descendent of the current Node.
 *
 * @example
 * node = await node.querySelector({selector: '#my-id'})
 * node = await node.querySelector('#my-id')
 *
 * @param {(Object|string)} args - selector arguments or selector
 * @return {Node}
 *
 */
Node.prototype.querySelector = function (args) {
  if (typeof args === 'string') {
    args = {selector: args}
  }
  args['nodeId'] = this.nodeId

  return this.driver.querySelector(args)
}

/**
 * Search for descendents of the current Node.
 *
 * @example
 * nodes = await node.querySelectorAll({selector: 'a'})
 * nodes = await node.querySelectorAll('a')
 *
 * @param {(Object|string)} args - selector arguments or selector
 * @return {Array.<Node>}
 *
 */
Node.prototype.querySelectorAll = function (args) {
  if (typeof args === 'string') {
    args = {selector: args}
  }
  args['nodeId'] = this.nodeId

  return this.driver.querySelectorAll(args)
}

/**
 * Set file selection on a file input element.
 *
 * @example
 * node.setFileInput({files: ['/opt/my-file.txt']})
 *
 * @param {Object} args
 *
 */
Node.prototype.setFileInput = function (args) {
  args.nodeId = this.nodeId
  return this.DOM.setFileInputFiles(args)
}

/**
 * Focus on the Node
 *
 * @example
 * node.focus()
 *
 */
Node.prototype.focus = function () {
  return this.DOM.focus({nodeId: this.nodeId})
}

/**
 * Test if the Node is clickable at a given location.
 *
 * @param {Object} args
 * @return {boolean} true if the element will directly receive a click event, otherwise false
 *
 */
Node.prototype.clickableAt = function (args) {
  return this.equal(this.DOM.getNodeForLocation(args))
}

/**
 * Resolve Node at default click point
 *
 * @param {Object} args
 * @return {Node} Node to directly receive click
 *
 */
Node.prototype.resolveNodeAtDefaultClickPoint = function () {
  const self = this
  return self.getClickCoords().then((result) => {
    return self.DOM.getNodeForLocation(result)
  }).then((result) => {
    return new Node(self.driver, result.nodeId).init()
  })
}

/**
 * Determine if the Node will receive a click
 *
 * @param {Object} args
 * @return {boolean}
 *
 */
Node.prototype.isClickable = function () {
  const self = this
  return self.resolveNodeAtDefaultClickPoint().then((result) => {
    return self.evaluate({
      functionDeclaration: function () {
        const self = this
        let node = arguments[0]

        while (node) {
          if (self.isSameNode(node)) {
            return true
          }
          node = node.parentNode
        }
        return false
      },
      args: [result]
    })
  })
}

/**
 * Calculate coordinates at the center of the Node for the click event.
 *
 * @return {{x:Number, y:Number}} coordinates for the click event.
 *
 */
Node.prototype.getClickCoords = function () {
  return this.DOM.getBoxModel({nodeId: this.nodeId}).then((result) => {
    const contentQuad = result.model.content
    return {
      x: Math.round((contentQuad[0] + contentQuad[2]) / 2),
      y: Math.round((contentQuad[1] + contentQuad[5]) / 2)
    }
  })
}

/**
 * Click on the Node.
 *
 * @example
 * node.click()
 *
 * @param {Object}
 *
 */
Node.prototype.click = function (args) {
  var options = args || {}
  options.offset = options.offset || {}
  var xOffset = options.offset.x || 0
  var yOffset = options.offset.y || 0
  var coords
  const self = this
  return this.getClickCoords().then((result) => {
    coords = result
    return self.Input.dispatchMouseEvent({
      type: 'mousePressed',
      x: coords.x + xOffset,
      y: coords.y + yOffset,
      modifiers: options.modifiers || 0,
      button: options.button || 'left',
      clickCount: options.clickCount || 1
    })
  }).then(() => {
    return self.Input.dispatchMouseEvent({
      type: 'mouseReleased',
      x: coords.x,
      y: coords.y,
      modifiers: options.modifiers || 0,
      button: options.button || 'left',
      clickCount: options.clickCount || 1
    })
  })
}

/**
 * Hover on the Node.
 *
 * @example
 * node.hover()
 *
 * @param {Object}
 */
Node.prototype.hover = function (args) {
  var options = args || {}
  var coords
  var self = this
  return this.getClickCoords().then((result) => {
    coords = result
    return self.Input.dispatchMouseEvent({
      type: 'mouseMoved',
      x: coords.x,
      y: coords.y,
      modifiers: options.modifiers || 0,
      button: options.button || 'none',
      clickCount: options.clickCount || 0
    })
  })
}

/**
 * Type text to the Node
 *
 * @example
 * node.sendKeys('jesg')
 *
 * @param {string} text - text to type into the node
 */
Node.prototype.sendKeys = function (text) {
  var self = this

  return this.focus().then(() => {
    return self.getAttribute('type')
  }).then((elemType) => {
    if (elemType === 'file') {
      return self.setFileInput({files: text.split('\n')})
    } else {
      var keyboard = new Keyboard(text)
      const keyEvents = keyboard.toKeyEvents().map(function (event) {
        return self.Input.dispatchKeyEvent(event)
      })

      return Promise.all(keyEvents)
    }
  })
}

/**
 * Set a property on the Node
 *
 * @example
 * node.setProperty('value', 'jesg')
 *
 * @param {string} name - properties name
 * @param {string} value - properties value
 */
Node.prototype.setProperty = function (name, value) {
  const self = this
  return self.evaluate({
    functionDeclaration: 'this[arguments[0]] = arguments[1]',
    args: [name, value]
  })
}

/**
 * @private
 *
 * Resolve the Node's remote object id.
 */
Node.prototype.toRemoteObject = function () {
  const self = this
  return self.DOM.resolveNode({nodeId: self.nodeId})
}

/**
 *
 * Get a property on the Node
 *
 * @example
 * value = await node.getProperty('value')
 *
 * @param {string} name - properties name
 * @return {string} properties value
 */
Node.prototype.getProperty = function (name) {
  return this.getProperties().then((properties) => {
    return properties[name]
  })
}

/**
 *
 * Get the Node's properties
 *
 * @example
 * properties = await node.getProperties()
 *
 * @return {Object} properties as key-value pairs
 */
Node.prototype.getProperties = function () {
  const self = this
  var obj
  return self.toRemoteObject().then((result) => {
    obj = result.object
    return self.Runtime.getProperties({
      objectId: obj.objectId,
      ownProperties: false,
      accessorPropertiesOnly: true
    })
  }).then((result) => {
    if (result.exceptionDetails) {
      return Promise.reject(new Error(JSON.stringify(result.exceptionDetails)))
    }
    const properties = result.result
    const len = properties.length
    const types = ['string', 'number', 'boolean']
    const data = {}

    for (var i = 0; i < len; i++) {
      const property = properties[i]
      if (typeof (property.value) !== 'undefined' && types.indexOf(property.value.type) !== -1) {
        data[property.name] = property.value.value
      }
    }

    return self.Runtime.releaseObject({objectId: obj.objectId}).then(() => {
      return data
    })
  })
}

/**
 *
 * Evaluate javascript in the context of this Node.
 *
 * @example
 * propertyValue = await node.evaluate({
 *     functionDeclaration: function(name) {
 *         return this[name];
 *     },
 *     args: [name],
 * });
 *
 *
 * @param {Object} options
 * @return {Object} resolved object
 */
Node.prototype.evaluate = function (options) {
  const self = this
  var scriptTimeout = Number.parseInt(options.timeout || self.driver.timeouts.script)
  var str = options.functionDeclaration
  if (typeof str !== 'function') {
    str = `function() {
            ${str}
        }`
  }
  str = str.toString().trim()

  options.functionDeclaration = `function() { const args = arguments; const self = this; return new Promise((resolve,reject) => {
        try {
            setTimeout(function() { reject(new Error('Chrominator Script Timeout')); }, ${scriptTimeout});
            resolve(function() {
                return ${str}
            }().apply(self, args));
        } catch(err) {
            reject(err);
        }
    }); }`

  options.objectId = self.objectId
  return self.driver._evaluate(options)
}

/**
 *
 * Evaluate Asynchronous javascript in the context of this Node.
 *
 * The `functionDeclaration` must call either `resolve` to resolve the promise or `reject` to reject the promise.
 *
 * @param {Object} options
 * @return {Object} resolved object
 */
Node.prototype.evaluateAsync = function (options) {
  const self = this
  var scriptTimeout = Number.parseInt(options.timeout || self.driver.timeouts.script)
  var str = options.functionDeclaration
  if (typeof str !== 'function') {
    str = `function() {
            ${str}
        }`
  }
  str = str.toString().trim()

  options.functionDeclaration = `function() { const args = arguments; const self = this; return new Promise((resolve,reject) => {
        try {
            setTimeout(function() { reject(new Error('Chrominator Script Timeout')); }, ${scriptTimeout});
            (function() {
                return ${str}
            }().apply(self, args));

        } catch(err) {
            reject(err);
        }
    }); }`

  options.objectId = self.objectId
  return self.driver._evaluate(options)
}

/**
 * Test if the Node is equal to another Node.
 *
 * @param {Node} node - The Node to test against
 * @return {boolean}
 */
Node.prototype.equal = function (node) {
  const self = this
    // nodeId is not a sufficient test.
  return self.evaluate({
    functionDeclaration: 'return this.isSameNode(arguments[0])',
    args: [node]
  })
}

/**
 * Get visible text.
 *
 * The current implementation does not clean whitespace.
 *
 * @return {string}
 */
Node.prototype.text = function (node) {
  const self = this
  return self.evaluate({
    functionDeclaration: 'return this.innerText'
  })
}

module.exports = Node
