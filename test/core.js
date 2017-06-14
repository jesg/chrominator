'use strict';

const assert = require('assert');
const Driver = require('./../index').Driver;
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const expect = require('chai').expect

describe('core api', function() {
    const baseHtml = fs.readFileSync(__dirname + '/../fixtures/base.html', 'utf-8');

    describe('query', function() {
        it('can query elements', function(done) {
            CDP((client) => {
                var driver;
                Driver.createDriver(client).then((result) => {
                    driver = result;
                    return driver.setContent(baseHtml);
                }).then(() => {
                    return driver.querySelectorAll({selector: 'div'})
                }).then((nodes) => {
                    expect(nodes.length).to.be.above(1);

                    client.close();
                    done();
                }).catch((err) => {

                    client.close();
                    done(err);
                });
            });
        });

        it('can query element', function(done) {
            CDP((client) => {
                var driver;
                var outerNode;
                Driver.createDriver(client).then((result) => {
                    driver = result;
                    return driver.setContent(baseHtml);
                }).then(() => {
                    return driver.querySelector({selector: 'div#outer'})
                }).then((node) => {
                    outerNode = node;
                    return outerNode.getAttribute('class');
                }).then((value) => {
                    expect(value).to.equal('outer');
                    return outerNode.getAttributes();
                }).then((attrs) => {
                    expect(attrs).to.deep.equal({id: 'outer', class: 'outer'});

                    client.close();
                    done();
                }).catch((err) => {

                    client.close();
                    done(err);
                });
            });
        });

        it('can query element from node', function(done) {
            CDP((client) => {
                var driver;
                Driver.createDriver(client).then((result) => {
                    driver = result;
                    return driver.setContent(baseHtml);
                }).then(() => {
                    return driver.querySelector({selector: 'div#outer'})
                }).then((node) => {
                    return node.querySelector({selector: 'div#inner'});
                }).then((node) => {
                    return node.getAttribute('class');
                }).then((value) => {
                    expect(value).to.equal('inner');

                    client.close();
                    done();
                }).catch((err) => {

                    client.close();
                    done(err);
                });
            });
        });

        it('can query elements from node', function(done) {
            CDP((client) => {
                var driver;
                Driver.createDriver(client).then((result) => {
                    driver = result;
                    return driver.setContent(baseHtml);
                }).then(() => {
                    return driver.querySelector({selector: 'div#outer'})
                }).then((node) => {
                    return node.querySelectorAll({selector: 'div'});
                }).then((nodes) => {
                    expect(nodes.length).to.be.above(1);

                    client.close();
                    done();
                }).catch((err) => {

                    client.close();
                    done(err);
                });
            });
        });

        it('can navigate to google.com', function(done) {
            CDP((client) => {
                var driver;
                Driver.createDriver(client).then((result) => {
                    driver = result;
                    return driver.navigate({url: 'https://www.google.com'});
                }).then(() => {
                    return driver.querySelector({selector: 'input[name="q"]'})
                }).then(() => {
                    client.close();
                    done();
                }).catch((err) => {

                    client.close();
                    done(err);
                });
            });
        });


        it('can search google.com', function(done) {
            CDP((client) => {
                var driver;
                var n;
                Driver.createDriver(client).then((result) => {
                    driver = result;
                    return driver.navigate({url: 'https://www.google.com'});
                }).then(() => {
                    return driver.querySelector({selector: 'input[name="q"]'})
                }).then((node) => {
                    n = node
                    return n.sendKeys('abc');
                }).then(() => {
                    return driver.spinBrowserEventLoop();
                }).then(() => {
                    return driver.querySelector({selector: 'input[value="Google Search"]'})
                }).then((node) => {
                    n = node;
                    return n.click()
                }).then(() => {
                    return driver.spinBrowserEventLoop();
                }).then(() => {
                    return driver.delay(1000);
                }).then(() => {
                    return driver.screenshot('first-google-search.png');
                }).then(() => {

                    client.close();
                    done();
                }).catch((err) => {

                    client.close();
                    done(err);
                });
            });
        });

    });
});
