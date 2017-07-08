'use strict';

var Keyboard = require('./keyboard').Keyboard;
const debug = require('debug')('chrominator.node');

var Node = function(driver, nodeId) {
    this.driver = driver
    this.crd = this.driver.crd;
    this.nodeId = nodeId;
    this.DOM = this.crd.DOM;
    this.Input = this.crd.Input;
    this.Runtime = this.crd.Runtime;
    this.objectGroup = 'global';
};

Node.prototype.init = function() {
    const self = this;
    return self.toRemoteObject().then((result) => {
        Object.defineProperty(self, 'objectId', {
            value: result.object.objectId,
            writable: false,
        });
        return self;
    });
};

// need factory method to create a driver instance

// raw get attributes
Node.prototype._getAttributes = function() {
    return this.DOM.getAttributes({nodeId: this.nodeId})
};

Node.prototype.getAttributes = function() {
    return this._getAttributes().then((result) => {
        const attrs = result['attributes'];
        const len = attrs.length;
        const data = {};

        for (var i = 0; i < len; i++) {
            data[attrs[i]] = attrs[++i]
        }
        return data;
    });
};

Node.prototype.getAttribute = function(name) {
    return this._getAttributes().then((result) => {
        const attrs = result['attributes'];
        const len = attrs.length;

        for (var i = 0; i < len; i++) {
            if ( attrs[i] === name ) {
                return attrs[i+1];
            }
        }
        return null;
    });
};

Node.prototype.querySelector = function(args) {
    const self = this;
    args['nodeId'] = this.nodeId;

    return this.DOM.querySelector(args).then((result) => {
        return new Node(self, result.nodeId);
    });
};

Node.prototype.querySelectorAll = function(args) {
    const self = this;
    args['nodeId'] = this.nodeId;

    return this.DOM.querySelectorAll(args).then((result) => {
        const nodeIds = result.nodeIds;
        const data = [];

        for (var nodeId in nodeIds) {
            data.push(new Node(self, nodeId));
        }

        return data
    });
};

Node.prototype.setFileInput = function(args) {
    args.nodeId = this.nodeId;
    return this.DOM.setFileInputFiles(args)
};

Node.prototype.focus = function() {
    return this.DOM.focus({nodeId: this.nodeId})
};

Node.prototype.clickableAt = function(args) {
    return this.DOM.getNodeForLocation(args) === this.nodeId;
};

Node.prototype.getClickCoords = function() {
    return this.DOM.getBoxModel({nodeId: this.nodeId}).then((result) => {
        const contentQuad = result.model.content;
        return {
            x: Math.round((contentQuad[0] + contentQuad[2])/2),
            y: Math.round((contentQuad[1] + contentQuad[5])/2)
        }
    });
};

Node.prototype.click = function(args) {
    var options = args || {};
    options.offset = options.offset || {};
    var xOffset = options.offset.x || 0;
    var yOffset = options.offset.y || 0;
    var coords;
    const self = this;
    return this.getClickCoords().then((result) => {
        coords = result;
        return self.Input.dispatchMouseEvent({
            type: 'mousePressed',
            x: coords.x + xOffset,
            y: coords.y + yOffset,
            modifiers: options.modifiers || 0,
            button: options.button || 'left',
            clickCount: options.clickCount || 1
        });
    }).then(() => {
        return self.Input.dispatchMouseEvent({
            type: 'mouseReleased',
            x: coords.x,
            y: coords.y,
            modifiers: options.modifiers || 0,
            button: options.button || 'left',
            clickCount: options.clickCount || 1
        });
    });
};

Node.prototype.hover = function(args) {
    var options = args || {};
    var coords;
    var self = this;
    return this.getClickCoords().then((result) => {
        coords = result;
        return self.Input.dispatchMouseEvent({
            type: 'mouseMoved',
            x: coords.x,
            y: coords.y,
            modifiers: options.modifiers || 0,
            button: options.button || 'none',
            clickCount: options.clickCount || 0
        });
    });
};

Node.prototype.sendKeys = function(text) {
    var self = this;

    return this.focus().then(() => {
        return self.getAttribute('type');
    }).then((elemType) => {
        if (elemType === 'file') {
            return self.setFileInput({files: text.split('\n')});
        } else {
            var keyboard = new Keyboard(text);
            const keyEvents = keyboard.toKeyEvents().map(function(event) {
                return self.Input.dispatchKeyEvent(event);
            });

            return Promise.all(keyEvents);
        }
    });
};

Node.prototype.setProperty = function(name, value) {
    const self = this;
    return self.evaluate({
        functionDeclaration: function(name, value) {
            this[name] = value;
        },
        args: [name, value],
    });
};

Node.prototype.toRemoteObject = function() {
    const self = this;
    return self.DOM.resolveNode({nodeId: self.nodeId});
};

Node.prototype.getProperty = function(name) {
    return this.getProperties().then((properties) => {
        return properties[name];
    });;
};

Node.prototype.getProperties = function() {
    const self = this;
    var obj;
    return self.toRemoteObject().then((result) => {
        obj = result.object;
        return self.Runtime.getProperties({
            objectId: obj.objectId,
            ownProperties: false,
            accessorPropertiesOnly: true
        });
    }).then((result) => {
        if ( result.exceptionDetails ) {
            return Promise.reject(new Error(JSON.stringify(result.exceptionDetails)));
        }
        const properties = result.result;
        const len = properties.length;
        const types = ['string', 'number', 'boolean'];
        const data = {};

        for (var i = 0; i < len; i++) {
            const property = properties[i];
            if (typeof(property.value) !== 'undefined' && types.indexOf(property.value.type) !== -1) {
              data[property.name] = property.value.value;
            }
        }

        return self.Runtime.releaseObject({objectId: obj.objectId}).then(() => {
            return data;
        });
    });
};

Node.prototype.evaluate = function(options) {
    const self = this;
    var scriptTimeout = Number.parseInt(options.timeout || self.driver.timeouts.script);
    var str = options.functionDeclaration;
    if (typeof str !== 'function') {
        str = `function() {
            ${str}
        }`
    }
    str = str.toString().trim();

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

    options.objectId = self.objectId;
    return self.driver._evaluate(options);
};


Node.prototype.evaluateAsync = function(options) {
    const self = this;
    var scriptTimeout = Number.parseInt(options.timeout || self.driver.timeouts.script);
    var str = options.functionDeclaration;
    if (typeof str !== 'function') {
        str = `function() {
            ${str}
        }`
    }
    str = str.toString().trim();

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

    options.objectId = self.objectId;
    return self.driver._evaluate(options);
};

Node.prototype.equal = function(node) {
    const self = this;
    return self.evaluate({
        functionDeclaration: function(node) {
            return this.isSameNode(node);
        },
        args: [node],
    });
};

module.exports = Node;
