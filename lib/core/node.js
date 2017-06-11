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

Node.prototype._getClickCoords = function() {
    return this.focus().then(() => {
    });
};

Node.prototype.click = function() {
    // need to get coordinates etc
    return this.focus().then(() => {
    });
};

Node.prototype.sendKeys = function() {
    // hard there are a million options
    return this.focus().then(() => {
    });
};

module.exports = Node;
