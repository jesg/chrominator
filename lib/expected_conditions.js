'use strict;'

/**
* @file Common expected conditions.
*/

const ExpectedConditions = {}

/**
 * Tests if a Node is present.
 *
 * @example
 * // returns Node
 * driver.until(ExpectedConditions.isNodePresent({selector: 'button[value="Search"]'}))
 *
*/
ExpectedConditions.isNodePresent = function (options) {
  return function (parent) {
    return parent.querySelector(options).then((result) => {
      return result
    }).catch((err) => {
      return false
    })
  }
}

/**
 * Tests if a Node is clickable.
 *
 * @example
 * // returns Node
 * driver.until(ExpectedConditions.isNodeClickable({selector: 'button[value="Search"]'}))
 *
*/
ExpectedConditions.isNodeClickable = function (options) {
  return function (parent) {
    let node
    return parent.querySelector(options).then((result) => {
      node = result
      return node.isClickable()
    }).then((result) => {
      return result ? node : false
    }).catch((err) => {
       return false
    })
  }
}

module.exports = ExpectedConditions
