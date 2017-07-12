'use strict';

const fs = require('fs');
const Node = require('./node');
const debug = require('debug')('chrominator.driver');
var resolveEvaluateResult = require('./remote_object');
const Wait = require('./../wait');

const readyStates = {
    loading: 0,
    interactive: 1,
    complete: 2,
}

var Driver = function(crd) {
    this.crd = crd;
    this.Page = this.crd.Page;
    this.DOM = this.crd.DOM;
    this.Network = this.crd.Network;
    this.Runtime = this.crd.Runtime;
    this.objectGroup = 'global';

    this.timeouts = {
        script: 30000, // ms
        pageLoad: 300000, // ms
    };

    this.pageLoadStrategy = 'complete'
    this.wait = new Wait({parent: this});

};

Driver.prototype.init = function() {
    return Promise.all([
        this.Page.enable(),
        this.DOM.enable(),
        this.Runtime.enable(),
        this.Network.enable()
    ]);
};

Driver.createDriver = function(crd) {
    const driver = new Driver(crd);
    return driver.init().then(() => { return driver });
};

Driver.prototype.navigate = function(args) {
    const self = this;
    const pageLoadStrategy = readyStates[args.pageLoadStrategy || this.pageLoadStrategy];

    return new Promise((resolve, reject) => {
        self.crd.once('Page.loadEventFired', function() {
            if (typeof pageLoadStrategy === 'undefined') {
                resolve('done');
                return;
            }
            self.evaluateAsync({
                functionDeclaration: function(readyState) {
                    const readyStates = {
                        loading: 0,
                        interactive: 1,
                        complete: 2,
                    }
                    if (readyStates[document.readyState] >= readyState) { resolve(); }

                    document.onreadystatechange = function() {
                        if (readyStates[document.readyState] >= readyState) { resolve(); }
                    };
                    if (readyStates[document.readyState] >= readyState) { resolve(); }
                },
                args: [pageLoadStrategy],
                timeout: self.timeouts.pageLoad || args.timeout }).then((result) => {

                    resolve('done');
                });
        });
        self.Page.navigate(args).catch((err) => { reject(err) });
    });
};

Driver.prototype.getDocument = function() {
    return this.DOM.getDocument();
};

Driver.prototype.querySelector = function(args) {
    const self = this;
    let node;
    return this.DOM.getDocument().then((node) => {
        args['nodeId'] = node.root.nodeId;
        return this.DOM.querySelector(args).then((result) => {
            node = new Node(self, result.nodeId);
            return node.init();
        });
    });
};

Driver.prototype.querySelectorAll = function(args) {
    const self = this;
    return this.DOM.getDocument().then((node) => {
        args['nodeId'] = node.root.nodeId;
        return this.DOM.querySelectorAll(args).then((result) => {
            const nodeIds = result.nodeIds;
            const data = [];

            for (let i in nodeIds) {
                const nodeId = nodeIds[i];
                data.push(new Node(self, nodeId).init());
            }

            return Promise.all(data);
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

// TODO move this out to a utils module
Driver.prototype.delay = function(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(function() { resolve(true); }, ms);
    });
};

Driver.prototype.spinBrowserEventLoop = function() {
    const self = this;
    return self.evaluateAsync({
        functionDeclaration: 'setTimeout(function() { resolve(true); }, 0);'
    });
};

// private version of evaluate
Driver.prototype._buildArgs = function(rawArgs) {
    const args = [];

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        // prefer the cached objectId to dynamically resolving the remote object
        // might be better for the object to handle caching in the future
        if (typeof arg.objectId === 'string') {
          args[i] = {objectId: arg.objectId};
        } else {
          args[i] = {value: arg}
        }
    }
    return Promise.resolve(args);
};

// private version of evaluate
Driver.prototype._evaluate = function(options) {
    const self = this;
    const objectId = options.objectId;
    const args = options.args || [];
    const script = options.functionDeclaration;

    return self._buildArgs(args).then((resolvedArgs) => {
        return self.Runtime.callFunctionOn(
        {
            functionDeclaration: script,
            arguments: resolvedArgs,
            objectId: objectId,
            returnByValue: false,
            awaitPromise: true}).then((result) => {
                if ( result.exceptionDetails ) {
                    return Promise.reject(new Error(JSON.stringify(result.exceptionDetails)));
                }
                const multiType = result.result.type + ':' + result.result.subtype;
                return resolveEvaluateResult(multiType, self, result.result);
            });
    });
};

Driver.prototype.evaluate = function(options) {
    const self = this;
    var scriptTimeout = Number.parseInt(options.timeout || self.timeouts.script);
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


    return this.DOM.getDocument().then((result) => {
        return self.DOM.resolveNode({nodeId: result.root.nodeId, objectGroup: self.objectGroup});
    }).then((result) => {
        options.objectId = result.object.objectId;
        return self._evaluate(options);
    });
};


Driver.prototype.evaluateAsync = function(options) {
    const self = this;
    var scriptTimeout = Number.parseInt(options.timeout || self.timeouts.script);
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

    return this.DOM.getDocument().then((result) => {
        return self.DOM.resolveNode({nodeId: result.root.nodeId, objectGroup: self.objectGroup});
    }).then((result) => {
        options.objectId = result.object.objectId;
        return self._evaluate(options);
    });
};

Driver.prototype.until = function(options) {
    return this.wait.until(options);
};

module.exports = Driver;
