'use strict';

const fs = require('fs');
const Node = require('./node');

var Driver = function(crd) {
    this.crd = crd;
    this.Page = this.crd.Page;
    this.DOM = this.crd.DOM;
    this.Network = this.crd.Network;
};

Driver.prototype.init = function() {
    return Promise.all([
        this.Page.enable(),
        this.DOM.enable(),
        this.Network.enable()
    ]);
};

Driver.createDriver = function(crd) {
    const driver = new Driver(crd);
    return driver.init().then(() => { return driver });
};

Driver.prototype.navigate = function(args) {
    const self = this;
    return new Promise((resolve, reject) => {
        self.crd.once('Page.loadEventFired', function() {
            resolve('done');
        });
        self.Page.navigate(args).catch((err) => { reject(err) });
        // need to have a page load timeout
    });
};

Driver.prototype.querySelector = function(args) {
    const self = this;
    return this.DOM.getDocument().then((node) => {
        args['nodeId'] = node.root.nodeId;
        return this.DOM.querySelector(args).then((result) => {
            console.log(result.nodeId);
            return new Node(self.crd, result.nodeId);
        });
    });
};

Driver.prototype.querySelectorAll = function(args) {
    const self = this;
    return this.DOM.getDocument().then((node) => {
        args['nodeId'] = node.root.nodeId;
        return this.DOM.querySelector(args).then((result) => {
            const nodeIds = result.nodeIds;
            const len = nodeIds.length;
            const data = [];

            for (var i = 0; i < len; i++) {
                data.push(new Node(self.crd, nodeIds[i]));
            }

            return data
        });
    });
};

Driver.prototype.reload = function() {
    const self = this;
    return new Promise((resolve, reject) => {
        self.crd.once('Page.loadEventFired', function() {
            resolve('done');
        });
        self.Page.reload({ignoreCache: true}).catch((err) => { reject(err) });
    });
};

Driver.prototype.pdf = function(path, options) {
    return this.Page.printToPdf(options).then((result) => {
        const data = Buffer.from(result.data, 'base64')
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(path);
                }
            });
        });
    });
};

Driver.prototype.screenshot = function(path, options) {
    // TODO file ext needs validation
    return this.Page.captureScreenshot(options).then((result) => {
        const data = Buffer.from(result.data, 'base64')
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(path);
                }
            });
        });
    });
};

Driver.prototype.setUserAgent = function(args) {
    return this.Network.setUserAgentOverride(args);
};

Driver.prototype.getCookies = function(args) {
    // handle no args .... should default to current url
    return this.Network.getCookies(args);
};

Driver.prototype.getAllCookies = function() {
    return this.Network.getAllCookies();
};

Driver.prototype.deleteAllCookies = function() {
    const self = this;
    return this.Network.canClearBrowserCookies().then((result) => {
        if ( result.result ) {
            return self.Network.clearBrowserCookies();
        } else {
            return Promise.reject(new Error('unable to clear browser cookies'))
        }
    });
};

Driver.prototype.setCookie = function(args) {
    // need intelligent defaults?
    return this.Network.setCookie(args);
};

Driver.prototype.setContent = function(html) {
    const self = this;
    return this.Page.navigate({url: 'about:blank'}).then((result) => {
        self.Page.setDocumentContent({frameId: result.frameId, html: html});
    });
};

module.exports = Driver;
