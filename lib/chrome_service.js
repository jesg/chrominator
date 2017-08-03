'use strict'

const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher')
const CDP = require('chrome-remote-interface')
const debug = require('debug')('chrominator.chrome_service')
const tmp = require('tmp')
const process = require('process')

const Driver = require('./core').Driver

var ChromeService = function (options) {
  this.createUserDataDir = false
  if (typeof options === 'undefined') {
    this.createUserDataDir = true
  }
  this.options = options || {
    port: 9222,
    chromeFlags: [
      // NOTE: The most common desktop screen resolution used online is currently: 1366x768
      // See http://gs.statcounter.com/#resolution-ww-monthly-201307-201312.
      // Jan 2017
      '--window-size=1366,768',
      '--headless',
      '--disable-gpu'
    ]}
}

ChromeService.prototype.createTmpUserDataDir = function () {
  const self = this
  if (!self.createUserDataDir) {
    return Promise.resolve(false)
  }
  return new Promise((resolve, reject) => {
    tmp.dir({prefix: 'chrominator-'+ process.pid + '-', unsafeCleanup: true}, (err, path, cleanupCallback) => {
      if (err) {
        return reject(err)
      }

      self.userDataDirCleanupCallback = cleanupCallback
      resolve(path)
    })
  })
}

ChromeService.prototype.launchChrome = function () {
  const self = this
  return self.createTmpUserDataDir().then((path) => {
    if (path) {
      debug('Created User Data Dir: ' + path)
      this.options.chromeFlags.push('--user-data-dir='+path)
    }
    return chromeLauncher.launch({
      port: this.options.port || 9222,
      chromeFlags: this.options.chromeFlags
    })
  })
}

ChromeService.prototype.start = function () {
  const self = this
  return this.launchChrome().then((result) => {
    self.chrome = result
    return CDP(self.options)
  }).then((result) => {
    self.crd = result
    return CDP.Version()
  }).then((version) => {
    const protocolVersion = version['Protocol-Version']
    if (protocolVersion !== '1.2') {
      console.error('You are running an unsupported protocol version ' + protocolVersion)
      console.error('Chrominator supports protocol version 1.2')
    }
    debug('Version: ' + JSON.stringify(version))
    return Driver.createDriver(self.crd)
  }).catch((err) => {
    console.error(err.stack || err)

    self.stop()
  })
}

ChromeService.prototype.stop = function () {
  return this.crd.close().then(() => {
      return this.chrome.kill()
  }).then(() => {
    if (this.createUserDataDir) {
      this.userDataDirCleanupCallback()
    }
  })
}

module.exports.ChromeService = ChromeService
