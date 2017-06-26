'use strict';

const Node = require('./node');
const multiResolveResult = {};

var rawValue = function(_, result) {
    return result.value;
};

multiResolveResult['number:undefined'] = rawValue;

multiResolveResult['string:undefined'] = rawValue;

multiResolveResult['object:null'] = rawValue;

// troubleshoot why this has issues
multiResolveResult['object:node'] = function(driver, result) {
    return driver.DOM.requestNode({objectId: result.objectId}).then((result) => {
        return new Node(driver, result.nodeId);
    });
};

// TODO timezone is wrong...
multiResolveResult['object:date'] = function(driver, result) {
    return new Date(result.description);
};

// need proxy for complex objects

module.exports = function(multiType, driver, result) {
    if (multiResolveResult.hasOwnProperty(multiType)) {
        return multiResolveResult[multiType](driver, result);
    }
    return result;
}
