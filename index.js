'use strict';

const Driver = require('./lib/core').Driver;
const ChromeService = require('./lib/chrome_service').ChromeService;


module.exports = function(options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = undefined;
    }
    var service = new ChromeService(options);

    service.start().then((driver) => {
        return callback(driver);
    }).then(() => {
        service.stop();
    }).catch((err) => {
        console.error(err.stack || err);

        service.stop();
    });
};

module.exports.Driver = Driver;
module.exports.ChromeService = ChromeService;
