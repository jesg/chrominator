'use strict';

var Node = function(crd, nodeId) {
    this.crd = crd;
    this.nodeId = nodeId;
    this.DOM = this.crd.DOM;
    this.Input = this.crd.Input;
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
        return new Node(self.crd, result.nodeId);
    });
};

Node.prototype.querySelectorAll = function(args) {
    const self = this;
    args['nodeId'] = this.nodeId;

    return this.DOM.querySelectorAll(args).then((result) => {
        const nodeIds = result.nodeIds;
        const data = [];

        for (var nodeId in nodeIds) {
            data.push(new Node(self.crd, nodeId));
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
    var coords;
    const self = this;
    return this.getClickCoords().then((result) => {
        coords = result;
        return self.Input.dispatchMouseEvent({
            type: 'mousePressed',
            x: coords.x,
            y: coords.y,
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
        const keyEvents = [];
        const len = text.length;

        for (var i = 0; i < len; i++) {
            keyEvents.push(
                self.Input.dispatchKeyEvent({
                    type: 'char',
                    text: text[i]
                })
            );
        }
        return Promise.all(keyEvents);
    });
};

module.exports = Node;
