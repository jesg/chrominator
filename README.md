[![Build Status](https://travis-ci.org/jesg/chrominator.svg?branch=master)](https://travis-ci.org/jesg/chrominator)

a high level api to chrome debugger for automation.

currently working on core api built on promises.  might provide a high level fluent api similar to nightmarejs in the future.

# TODO

* add core unit tests
* implement click
* implement send keys
* better page navigation (should intelligently wait for the page to load)
* evaluate script

example

```
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const Driver = require('chrominator').Driver;

CDP({remote: true}, async (client) => {
  // Extract used DevTools domains.
  const driver = await Driver.createDriver(client);

  driver.navigate({url: 'https://www.google.com'})
  await driver.screenshot('screen.png');
  await driver.querySelector({selector: 'input[name="q"]'}).then((node) => {
      node.getAttributes().then((value) => {
          console.log(JSON.stringify(value));
      });
  });
  await driver.deleteAllCookies();
  client.close();
}).on('error', (err) => {
  console.error('Cannot connect to browser:', err);
});

```
