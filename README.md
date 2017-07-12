[![npm version](https://img.shields.io/npm/v/chrominator.svg?style=flat-square)](https://www.npmjs.com/package/chrominator)

[![Build Status](https://travis-ci.org/jesg/chrominator.svg?branch=master)](https://travis-ci.org/jesg/chrominator)

a high level api to chrome debugger for automation.

currently working on core api built on promises.  might provide a high level fluent api similar to nightmarejs in the future.
```javascript
const Chrominator = require('chrominator');
const ExpectedConditions = Chrominator.ExpectedConditions;

Chrominator(async (driver) => {
    await driver.navigate({url: 'https://www.google.com'})
    const search = await driver.querySelector({selector: 'input[name="q"]'})
    await search.sendKeys('yellow');
    const searchButton = await driver.until(ExpectedConditions.is_node_present({selector: 'button[value="Search"]'}))
    await searchButton.click();
    await driver.delay(1000);
    await driver.screenshot('screenshot.png', {format: 'png'});
});
```

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## ExpectedConditions

Common expected conditions.

### is_node_present

Tests if a Node is present.

**Parameters**

-   `options`  

**Examples**

```javascript
// returns Node
driver.until(ExpectedConditions.is_node_present({selector: 'button[value="Search"]'}))
```

# License

MIT
