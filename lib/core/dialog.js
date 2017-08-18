'use strict'

const debug = require('debug')('chrominator.dialog')

/**
* Abstract JavaScript Dialog
*
* Warning: broken upstream
* @module Dialog
*/

/**
 * @constructor
 * @param {Driver} driver
 * @param {Object} alert - alert meta-data
 */
var Dialog = function (driver, data) {
  this.driver = driver
  this.crd = this.driver.crd

  this.url = data.url
  this.message = data.message
  this.type = data.type
  this.defaultPrompt = data.defaultPrompt
}


/**
 * Dismiss a JavaScript Dialog
 *
 * @example
 * await alert.dismiss()
 *
 */
Dialog.prototype.dismiss = function () {
  return this.handle({accept: false})
}

/**
 * Accept a JavaScript Dialog
 *
 * @example
 * await alert.accept()
 *
 */
Dialog.prototype.accept = function () {
  return this.handle({accept: true})
}

/**
 * Handle a JavaScript Dialog
 *
 * @example
 * await alert.handle({accept: true})
 * // or
 * await alert.handle({accept: true, promptText: 'hello'})
 *
 */
Dialog.prototype.handle = function (options) {
  const driver = this.driver
  return driver.waitForEvent('Page.javascriptDialogClosed', () => {
    return driver.handleJavaScriptDialog(options)
  })
}


module.exports = Dialog
