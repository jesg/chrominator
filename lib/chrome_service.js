'use strict'

const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher')
const CDP = require('chrome-remote-interface')
const debug = require('debug')('chrominator.chrome_service')

const Driver = require('./core').Driver

var ChromeService = function (options) {
  this.options = options || {
    port: 9222,
    chromeFlags: [
      '--headless',
      '--disable-gpu'
    ]}
}

ChromeService.prototype.launchChrome = function () {
  return chromeLauncher.launch({
    port: this.options.port || 9222,
    chromeFlags: this.options.chromeFlags
  })
}

ChromeService.prototype.start = function () {
  const self = this
  return this.launchChrome().then((result) => {
    self.chrome = result
    return CDP(self.options)
  }).then((result) => {
    self.crd = result
    return Driver.createDriver(self.crd)
  }).catch((err) => {
    console.error(err.stack || err)

    self.stop()
  })
}

ChromeService.prototype.stop = function () {
  return this.crd.close().then(() => {
      return this.chrome.kill()
  })
}

module.exports.ChromeService = ChromeService
