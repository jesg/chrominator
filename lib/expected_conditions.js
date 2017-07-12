'use strict;'

/**
* @file Common expected conditions.
*/

const ExpectedConditions = {};

/**
 * Tests if a Node is present.
 *
 * @example
 * // returns Node
 * driver.until(ExpectedConditions.is_node_present({selector: 'button[value="Search"]'}))
 *
*/
ExpectedConditions.is_node_present = function(options) {
    return function(parent) {
        return parent.querySelector(options).then((result, err) => {
            if (typeof err !== 'undefined') {
                return false;
            }
            return result;
        });
    };
};

module.exports = ExpectedConditions;
