'use strict'

const fs = require('fs')
const path = require('path')
const Node = require('./node')
const debug = require('debug')('chrominator.driver')
var resolveEvaluateResult = require('./remote_object')
const Wait = require('./../wait')
const ExpectedConditions = require('./../expected_conditions')

const readyStates = {
  none: -1,
  loading: 0,
  interactive: 1,
  complete: 2
}

/**
* Abstraction to drive a webpage
* @module Driver
*
*/

/**
 * @private
 * @constructor
 * @param {Object} crd - an instance of chrome remote debugger
 */
var Driver = function (crd) {
  this.crd = crd
  this.Page = this.crd.Page
  this.DOM = this.crd.DOM
  this.Network = this.crd.Network
  this.Runtime = this.crd.Runtime
  this.objectGroup = 'global'

  this.timeouts = {
    script: 30000, // ms
    pageLoad: 300000 // ms
  }

  this.pageLoadStrategy = 'complete'
  this.wait = new Wait({parent: this})
}

Driver.prototype.init = function () {
  debug('init')
  return Promise.all([
    this.Page.enable(),
    this.DOM.enable(),
    this.Runtime.enable(),
    this.Network.enable()
  ])
}

/**
 * Create and initialize the driver.
 *
 * @example
 * Driver.createDriver(crd)
 *
 * @static
 * @param {Object} crd - an instance of chrome remote debugger
 */
Driver.createDriver = function (crd) {
  const driver = new Driver(crd)
  return driver.init().then(() => { return driver })
}

/**
 * Navigate to a page and wait for the page to load.
 *
 * @example
 * await driver.navigate({url: 'http://google.com', pageLoadStrategy: 'interactive'})
 * // or
 * await driver.navigate('http://google.com')
 *
 * @param {{pageLoadStrategy: {(string|undefined)}, timeout: {number}} args
 */
Driver.prototype.navigate = function (args) {
  const self = this
  if (typeof args === 'string') {
    args = {url: args}
  }
  args['action'] = () => { return self.Page.navigate(args) }
  return self._triggerPageLoad(args)
}

/**
 * @private
 *
 * Wait for an action to trigger a page load
 *
 * @example
 * await driver._triggerPageLoad({action: () => { driver.reload() }, pageLoadStrategy: 'interactive', timeout: 200})
 *
 * @param {{action: {function}, pageLoadStrategy: {(string|undefined)}, timeout: {number}} args
 */
Driver.prototype._triggerPageLoad = function (args) {
  const self = this
  const pageLoadStrategy = readyStates[args.pageLoadStrategy || this.pageLoadStrategy]

  return new Promise((resolve, reject) => {
    if (pageLoadStrategy > -1) {
      self.crd.once('Page.domContentEventFired', function () {
        self.evaluateAsync({
          functionDeclaration: function (readyState) {
            const readyStates = {
              loading: 0,
              interactive: 1,
              complete: 2
            }
            document.onreadystatechange = function () {
              if (readyStates[document.readyState] >= readyState) { resolve() }
            }
            if (readyStates[document.readyState] >= readyState) { resolve() }
          },
          args: [pageLoadStrategy],
          timeout: self.timeouts.pageLoad || args.timeout }).then((result) => {
            resolve('done')
          })
      })
    }
    args['action']().catch((err) => { reject(err) })
    if (pageLoadStrategy === -1) {
      resolve('done')
    }
  })
}

Driver.prototype.getDocument = function () {
  return this.DOM.getDocument()
}

/**
 * Get the title of the current page
 *
 * @example
 * title = await driver.title()
 *
 * @return {string}
 */
Driver.prototype.title = function () {
  return this.evaluate({
    functionDeclaration: 'return document.title'
  })
}

/**
 * Search for a Node in the current document
 *
 * @example
 * node = await driver.querySelector({selector: '#my-id'})
 * node = await driver.querySelector('#my-id')
 *
 * @param {(Object|string)} args - selector arguments or selector
 * @return {Node}
 */
Driver.prototype.querySelector = function (args) {
  const self = this
  if (typeof args === 'string') {
    args = {selector: args}
  }
  return this.DOM.getDocument().then((node) => {
    args['nodeId'] = node.root.nodeId
    return this.DOM.querySelector(args).then((result) => {
      const node = new Node(self, result.nodeId)
      return node.init()
    })
  })
}

/**
 * Search for Nodes in the current document
 *
 * @example
 * nodes = await driver.querySelectorAll({selector: 'a'})
 * nodes = await driver.querySelectorAll('a')
 *
 * @param {(Object|string)} args - selector arguments or selector
 * @return {Node}
 */
Driver.prototype.querySelectorAll = function (args) {
  const self = this
  if (typeof args === 'string') {
    args = {selector: args}
  }
  return this.DOM.getDocument().then((node) => {
    args['nodeId'] = node.root.nodeId
    return this.DOM.querySelectorAll(args).then((result) => {
      const nodeIds = result.nodeIds
      const data = []

      for (let i in nodeIds) {
        const nodeId = nodeIds[i]
        data.push(new Node(self, nodeId).init())
      }

      return Promise.all(data)
    })
  })
}

/**
 * Reload the current page
 *
 * @example
 * await driver.reload()
 * or
 * await driver.reload({pageLoadStrategy: 'interactive', timeout: 200})
 *
 * @param {{pageLoadStrategy: {(string|undefined)}, timeout: {number}} args}
 *
 */
Driver.prototype.reload = function (args) {
  const self = this
  args = args || {}
  args['action'] = () => { return self.Page.reload({ignoreCache: true}) }
  return self._triggerPageLoad(args)
}

/**
 * Print the current page to pdf.
 *
 * @example
 * // writes image to file
 * driver.pdf({path: '/opt/save.pdf'})
 *
 * // writes image to file
 * driver.pdf('/opt/save.pdf')
 *
 * // returns base64 encoding
 * driver.pdf()
 *
 * @param {(Object|string|undefined)} options - pdf options
 */
Driver.prototype.pdf = function (options) {
  const optionsType = typeof options
  if (optionsType === 'string') {
    options = {path: options}
  } else if (optionsType === 'undefined') {
    options = {}
  }
  return this.Page.printToPDF(options).then((result) => {
    if (typeof options.path === 'undefined') {
      return Promise.resolve(result.data)
    }
    const data = Buffer.from(result.data, 'base64')
    return new Promise((resolve, reject) => {
      fs.writeFile(options.path, data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

/**
 * Take a screenshot
 *
 * @example
 * // writes image to file
 * driver.screenshot({path: 'screenshot.png'});
 *
 * // writes image to file
 * driver.screenshot('screenshot.png');
 *
 * // returns base64 encoding.
 * driver.screenshot();
 *
 * @param {(Object|string|undefined)} options - image options
 */
Driver.prototype.screenshot = function (options) {
  const optionsType = typeof options
  if (optionsType === 'string') {
    options = {path: options, format: path.extname(options).substring(1)}
  } else if (optionsType === 'undefined') {
    options = {format: 'png'}
  } else if (!options.hasOwnProperty('format')) {
    options['format'] = path.extname(options['path']).substring(1)
  }
  const filename = options.path
  options.format = options.format || path.extname(filename.toLowerCase())
  return this.Page.captureScreenshot(options).then((result) => {
    if (typeof filename === 'undefined') {
      return Promise.resolve(result.data)
    }
    const data = Buffer.from(result.data, 'base64')
    return new Promise((resolve, reject) => {
      fs.writeFile(options.path, data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

/**
 * Set the browsers user agent
 *
 * @example
 * driver.setUserAgent({userAgent: 'chrominator'})
 *
 * @param {Object} args
 */
Driver.prototype.setUserAgent = function (args) {
  return this.Network.setUserAgentOverride(args)
}

/**
 * Get cookies
 *
 * @param {Object} args
 */
Driver.prototype.getCookies = function (args) {
    // handle no args .... should default to current url
  return this.Network.getCookies(args)
}

/**
 * Get All cookies
 */
Driver.prototype.getAllCookies = function () {
  return this.Network.getAllCookies()
}

/**
 * Delete All cookies
 */
Driver.prototype.deleteAllCookies = function () {
  const self = this
  return this.Network.canClearBrowserCookies().then((result) => {
    if (result.result) {
      return self.Network.clearBrowserCookies()
    } else {
      return Promise.reject(new Error('unable to clear browser cookies'))
    }
  })
}

/**
 * Set a cookie
 */
Driver.prototype.setCookie = function (args) {
    // need intelligent defaults?
  return this.Network.setCookie(args)
}

/**
 * Set the page content
 *
 * @example
 * driver.setContent('<div>hello</div>')
 */
Driver.prototype.setContent = function (html) {
  const self = this
  return this.Page.navigate({url: 'about:blank'}).then((result) => {
    self.Page.setDocumentContent({frameId: result.frameId, html: html})
  })
}

/**
 * Async delay.
 *
 * @example
 * await driver.delay(500)
 *
 * @param {number} ms - number of milliseconds
 */
Driver.prototype.delay = function (ms) {
  return new Promise((resolve, reject) => {
    setTimeout(function () { resolve(true) }, ms)
  })
}

/**
 * @private
 * experimental: spin event loop at least once in the browser.
 */
Driver.prototype.spinBrowserEventLoop = function () {
  const self = this
  return self.evaluateAsync({
    functionDeclaration: 'setTimeout(function() { resolve(true); }, 0);'
  })
}

/**
 * @private
 * build arguments for _evaluate
 */
Driver.prototype._buildArgs = function (rawArgs) {
  const args = []

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i]
        // prefer the cached objectId to dynamically resolving the remote object
        // might be better for the object to handle caching in the future
    if (typeof arg.objectId === 'string') {
      args[i] = {objectId: arg.objectId}
    } else {
      args[i] = {value: arg}
    }
  }
  return Promise.resolve(args)
}

/**
 * @private
 * generic evaluate method.  does not wrap `functionDeclaration`
 */
Driver.prototype._evaluate = function (options) {
  const self = this
  const objectId = options.objectId
  const args = options.args || []
  const script = options.functionDeclaration

  return self._buildArgs(args).then((resolvedArgs) => {
    return self.Runtime.callFunctionOn(
      {
        functionDeclaration: script,
        arguments: resolvedArgs,
        objectId: objectId,
        returnByValue: false,
        awaitPromise: true}).then((result) => {
          if (result.exceptionDetails) {
            return Promise.reject(new Error(JSON.stringify(result.exceptionDetails)))
          }
          const multiType = result.result.type + ':' + result.result.subtype
          return resolveEvaluateResult(multiType, self, result.result)
        })
  })
}

/**
 *
 * Evaluate javascript
 *
 * @example
 * result = await node.evaluate({
 *     functionDeclaration: function(n) {
 *         return n + 1;
 *     },
 *     args: [n],
 * });
 *
 *
 * @param {Object} options
 * @return {Object} resolved object
 */
Driver.prototype.evaluate = function (options) {
  const self = this
  var scriptTimeout = Number.parseInt(options.timeout || self.timeouts.script)
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

  return this.DOM.getDocument().then((result) => {
    return self.DOM.resolveNode({nodeId: result.root.nodeId, objectGroup: self.objectGroup})
  }).then((result) => {
    options.objectId = result.object.objectId
    return self._evaluate(options)
  })
}

/**
 *
 * Evaluate Asynchronous javascript
 *
 * The `functionDeclaration` must call either `resolve` to resolve the promise or `reject` to reject the promise.
 *
 * @param {Object} options
 * @return {Object} resolved object
 */
Driver.prototype.evaluateAsync = function (options) {
  const self = this
  var scriptTimeout = Number.parseInt(options.timeout || self.timeouts.script)
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

  return this.DOM.getDocument().then((result) => {
    return self.DOM.resolveNode({nodeId: result.root.nodeId, objectGroup: self.objectGroup})
  }).then((result) => {
    options.objectId = result.object.objectId
    return self._evaluate(options)
  })
}

/**
 * Get the url of the current page
 *
 * @example
 * url = await driver.currentUrl()
 *
 * @return {string} the current url
 */
Driver.prototype.currentUrl = function () {
  const self = this
  return self.evaluate({
    functionDeclaration: 'return document.location.href'
  })
}

/**
 * Wait for a condition to be satisfied.
 *
 * @example
 * node = await driver.until(ExpectedConditions.isNodePresent({selector: 'button[value="Search"]'}))
 *
 * @param {function} condition - The condition to wait for.
 */
Driver.prototype.until = function (condition) {
  return this.wait.until(condition)
}

/**
 * Wait for a condition to not be satisfied.
 *
 * @example
 * node = await driver.until_not(ExpectedConditions.isNodePresent({selector: 'button[value="Search"]'}))
 *
 * @param {function} condition - The condition to wait for.
 */
Driver.prototype.until_not = function (condition) {
  return this.wait.until_not(condition)
}

/**
 * Wait for a Node to be present
 *
 * @example
 * node = await driver.waitForNodePresent('button[value="Search"]')
 *
 * @param {string} selector - css selector
 * @return {Node}
 */
Driver.prototype.waitForNodePresent = function (selector) {
  return this.wait.until(ExpectedConditions.isNodePresent({selector: selector}))
}

/**
 * Wait for a Node to not be present
 *
 * @example
 * node = await driver.waitForNodeNotPresent('button[value="Search"]')
 *
 * @param {string} selector - css selector
 */
Driver.prototype.waitForNodeNotPresent = function (selector) {
  return this.wait.until_not(ExpectedConditions.isNodePresent({selector: selector}))
}

/**
 * Wait for a Node to be clickable
 *
 * @example
 * node = await driver.waitForNodeClickable('button[value="Search"]')
 *
 * @param {string} selector - css selector
 * @return {Node}
 */
Driver.prototype.waitForNodeClickable = function (selector) {
  return this.wait.until(ExpectedConditions.isNodeClickable({selector: selector}))
}

/**
 * Wait for a Node to not be clickable
 *
 * @example
 * node = await driver.waitForNodeNotClickable('button[value="Search"]')
 *
 * @param {string} selector - css selector
 * @return {Node}
 */
Driver.prototype.waitForNodeNotClickable = function (selector) {
  return this.wait.until_not(ExpectedConditions.isNodeClickable({selector: selector}))
}

/**
 * Wait for title
 *
 * @example
 * await driver.waitForTitle('Google')
 *
 * @param {string} title - page title
 */
Driver.prototype.waitForTitle = function (title) {
  return this.wait.until(ExpectedConditions.titleIs(title))
}

module.exports = Driver
