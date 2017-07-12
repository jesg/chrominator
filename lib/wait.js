'use strict;'

const Wait = function(options) {
    this.parent = options.parent;
    this.timeout = options.timeout || 5000; // ms
    this.pollFrequency = options.pollFrequency || 500; // ms
    // TODO ignore errors
}

Wait.prototype.until = function(condition) {
    const self = this;
    const endTime = Date.now() + self.timeout;

    return new Promise((resolve, reject) => {
        const _poll = () => {
            condition(self.parent).then((value) => {
                if (value) {
                    resolve(value);
                    return;
                }
                if (Date.now() > end_time) {
                    reject(new Error('Timeout'));
                    return;
                }
                setTimeout(_poll, self.pollFrequency);
            });
        }
        return _poll();
    });
};

module.exports = Wait;
