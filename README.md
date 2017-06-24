[![Build Status](https://travis-ci.org/jesg/chrominator.svg?branch=master)](https://travis-ci.org/jesg/chrominator)

a high level api to chrome debugger for automation.

currently working on core api built on promises.  might provide a high level fluent api similar to nightmarejs in the future.

```
const Chrominator = require('chrominator');

Chrominator(async (driver) => {
    driver.navigate({url: 'https://www.google.com'})
    await driver.screenshot('screen.png');
    await driver.querySelector({selector: 'input[name="q"]'}).then((node) => {
        node.getAttributes().then((value) => {
            console.log(JSON.stringify(value));
        });
    });
    await driver.deleteAllCookies();
});
```

# License

MIT
